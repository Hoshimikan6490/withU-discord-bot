// Button interaction handlers for the Discord BOT
const { getDatabaseFromSchoolID } = require("../database/databaseController");
const joinedMemberGuide = require("../events/joinedMemberGuide");
const {
	createStandardEmbed,
	createContinueButton,
	createUserTypeButtons,
	createApprovalButtons,
	disableMessageButtons,
	fetchGuildAndMember,
} = require("../utils/discordUtils");
const {
	sendJoinProcessLog,
	findOrCreateRole,
} = require("../utils/registrationUtils");
const {
	createUniversityNameModal,
	createOrganizationNameModal,
	createUniversitySelfIntroductionModal,
	createOrganizationSelfIntroductionModal,
} = require("../utils/modalUtils");
const ErrorHandler = require("../monitoring/errorHandler");
const {
	SUCCESS_MESSAGES,
	EMBED_TITLES,
	EMBED_COLORS,
} = require("../config/constants");

/**
 * Handles the main "continue" button from the initial guild join message
 */
async function handleGuildJoinContinue(interaction) {
	const embed = createStandardEmbed(
		"下のボタンから参加種別を設定してください。",
		null
	);

	const userTypeButtons = createUserTypeButtons();

	await interaction.reply({
		embeds: [embed],
		components: [userTypeButtons],
	});

	// Disable the original continue button
	const [guildJoinContinue, embed1, embed2, embed3] = await joinedMemberGuide();
	guildJoinContinue.components[0].setDisabled(true);

	const channel = await interaction.user.createDM();
	const message = await channel.messages.fetch(interaction.message.id);
	await message.edit({
		embeds: [embed1, embed2, embed3],
		components: [guildJoinContinue],
	});
}

/**
 * Handles university name input modal display
 */
async function handleUniversityNameInputModal(interaction, buttonId) {
	const customId =
		buttonId === "reShowUniversityNameInputModal"
			? "reAskUniversityName"
			: "askUniversityName";

	const modal = createUniversityNameModal(customId);
	await interaction.showModal(modal);
}

/**
 * Handles organization name input modal display
 */
async function handleOrganizationNameInputModal(interaction, buttonId) {
	const customId =
		buttonId === "reShowOrganizationNameInputModal"
			? "reAskOrganizationName"
			: "askOrganizationName";

	const modal = createOrganizationNameModal(customId);
	await interaction.showModal(modal);
}

/**
 * Handles university registration confirmation
 */
async function handleUniversityNameCorrect(interaction, customId) {
	await interaction.deferReply();
	await universityRegister(interaction.client, interaction, customId);
}

/**
 * Handles organization registration confirmation
 */
async function handleOrganizationNameCorrect(interaction) {
	await interaction.deferReply();

	const organizationName = interaction.message.embeds[0].title
		.split("「")[1]
		.split("」")[0];

	// Send confirmation message to admin channel
	const channel = await interaction.client.channels.cache.get(
		process.env.adminChannelID
	);

	const adminConfirmEmbed = createStandardEmbed(
		EMBED_TITLES.ADMIN_CONFIRMATION,
		`<@${interaction.user.id}>さんが、組織名「${organizationName}」として登録を希望しています。\n\nこの組織名で登録してもよろしいでしょうか？\n\nもし問題がある場合は、以下のボタンを押して登録をキャンセルしてください。`,
		EMBED_COLORS.INFO,
		{
			footer: { text: `管理ID: ${interaction.message.id}` },
		}
	);

	const adminConfirmButtons = createApprovalButtons(
		`organizationNameConfirm-${interaction.user.id}`,
		`organizationNameReject-${interaction.user.id}`
	);

	await channel.send({
		embeds: [adminConfirmEmbed],
		components: [adminConfirmButtons],
	});

	// Disable the original buttons
	const disabledActionRows = disableMessageButtons(interaction.message);
	const dmChannel = await interaction.user.createDM();
	const message = await dmChannel.messages.fetch(interaction.message.id);
	await message.edit({
		components: disabledActionRows,
	});

	// Notify user they're waiting for approval
	const waitEmbed = createStandardEmbed(
		EMBED_TITLES.WAITING_FOR_ADMIN,
		"サーバー管理者に、あなたが参加希望である旨を報告しました。参加可否の判断が出るまで、しばらくお待ちください。判断が出次第、このDMでお知らせします。\n\nなお、管理者の都合により、判断に時間がかかる場合がありますので、ご了承ください。",
		EMBED_COLORS.WARNING
	);

	return interaction.editReply({
		embeds: [waitEmbed],
	});
}

/**
 * Handles organization registration approval by admin
 */
async function handleOrganizationNameConfirm(interaction) {
	const messageId =
		interaction.message.embeds[0].footer.text.split("管理ID: ")[1];

	// Disable buttons
	const disabledActionRows = disableMessageButtons(interaction.message);
	await interaction.message.edit({
		components: disabledActionRows,
	});
	await interaction.reply(SUCCESS_MESSAGES.ORGANIZATION_APPROVED);

	// Get user ID and proceed with registration
	const userId = interaction.message.embeds[0].description
		.split("<@")[1]
		.split(">")[0];

	await organizationRegister(
		interaction.client,
		interaction,
		userId,
		messageId
	);
}

/**
 * Handles organization registration rejection by admin
 */
async function handleOrganizationNameReject(interaction, buttonId) {
	const userId = buttonId.split("-")[1];
	const user = await interaction.client.users.fetch(userId);
	const channel = await user.createDM();

	// Disable buttons
	const disabledActionRows = disableMessageButtons(interaction.message);
	await interaction.message.edit({
		components: disabledActionRows,
	});
	await interaction.reply(SUCCESS_MESSAGES.ORGANIZATION_REJECTED);

	// Send rejection message to user
	const rejectEmbed = createStandardEmbed(
		EMBED_TITLES.PARTICIPATION_REJECTED,
		"サーバー管理者により、参加が拒否されました。この判断が誤っている場合は、サーバー管理者に直接お問い合わせください。",
		EMBED_COLORS.ERROR
	);

	return channel.send({
		embeds: [rejectEmbed],
	});
}

/**
 * Handles self-introduction registration continue button
 */
async function handleSelfIntroductionRegisterContinue(interaction, buttonId) {
	if (buttonId.includes("MI")) {
		// Organization registration
		const messageId = buttonId.split("-MI")[1];
		const channel = await interaction.user.createDM();
		const message = await channel.messages.fetch(messageId);

		const organizationName = message.content
			? message.content.split("「")[1].split("」")[0]
			: message.embeds[0].title.split("「")[1].split("」")[0];

		const modal = createOrganizationSelfIntroductionModal(
			"userSelfIntroductionModal",
			organizationName
		);

		await interaction.showModal(modal);
	} else if (buttonId.includes("UI")) {
		// University registration
		const universityID = buttonId.split("-UI")[1];
		const modal = createUniversitySelfIntroductionModal(
			`userSelfIntroductionModal-${universityID}`
		);

		await interaction.showModal(modal);
	}
}

/**
 * Main university registration function
 */
async function universityRegister(client, interaction, customId) {
	const universityID = customId.split("-")[1];
	const universityInfo = getDatabaseFromSchoolID(universityID);
	const universityName = universityInfo[0].schoolName;

	const continueButton = createContinueButton(
		`SelfIntroductionRegisterContinue-UI${universityID}`
	);

	try {
		const { guild, member } = await fetchGuildAndMember(
			client,
			interaction.user.id
		);
		const role = await findOrCreateRole(guild, universityName);

		// Check if user already has the role
		if (member.roles.cache.some((role) => role.name === universityName)) {
			return interaction.editReply({
				content:
					"⚠️　既に大学選択処理は完了しています。\n次の自己紹介登録へお進みください。",
				components: [continueButton],
			});
		}

		await member.roles.add(role);
	} catch (err) {
		return ErrorHandler.handleRoleError(err, interaction);
	}

	// Disable registration screen
	const channel = await interaction.user.createDM();
	const message = await channel.messages.fetch(interaction.message.id);

	const disabledButtonEmbed = createStandardEmbed(
		`「${universityInfo[0].schoolName}」を登録しますか？`,
		null,
		EMBED_COLORS.INFO,
		{
			footer: {
				text: "※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。",
			},
		}
	);

	const disabledActionRows = disableMessageButtons(message);

	await message.edit({
		embeds: [disabledButtonEmbed],
		components: disabledActionRows,
	});

	// Log the registration
	await sendJoinProcessLog(
		client,
		"universityRegisterFinished",
		universityName,
		interaction.user.id
	);

	// Show success message
	const successEmbed = createStandardEmbed(
		EMBED_TITLES.UNIVERSITY_APPROVED,
		`あなたの所属大学名を__**${universityName}**__に設定しました！\n\n続いて、自己紹介の入力をお願い致します。これが完了しますと、入室手続きは完了となります。`,
		EMBED_COLORS.SUCCESS,
		{
			footer: {
				text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
			},
		}
	);

	await interaction.editReply({
		embeds: [successEmbed],
		components: [continueButton],
	});
}

/**
 * Main organization registration function
 */
async function organizationRegister(client, interaction, userId, messageId) {
	const organizationName = interaction.message.embeds[0].description
		.split("「")[1]
		.split("」")[0];

	const continueButton = createContinueButton(
		`SelfIntroductionRegisterContinue-MI${messageId}`
	);

	try {
		const { guild } = await fetchGuildAndMember(client, userId);
		await findOrCreateRole(guild, organizationName);
	} catch (err) {
		return ErrorHandler.handleRoleError(err, interaction);
	}

	// Log the registration
	await sendJoinProcessLog(
		client,
		"organizationRegisterFinished",
		organizationName,
		userId
	);

	// Send success message to user
	const successEmbed = createStandardEmbed(
		EMBED_TITLES.ORGANIZATION_APPROVED,
		`あなたの所属組織名を__**「${organizationName}」**__に設定しました！\n\n続いて、自己紹介の入力をお願い致します。これが完了しますと、入室手続きは完了となります。`,
		EMBED_COLORS.SUCCESS,
		{
			footer: {
				text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
			},
		}
	);

	const user = await client.users.fetch(userId);
	const channel = await user.createDM();
	await channel.send({
		embeds: [successEmbed],
		components: [continueButton],
	});
}

/**
 * Main button interaction handler
 */
async function handleButtonInteraction(client, interaction) {
	const buttonId = interaction.customId;

	try {
		if (buttonId === "guildJoinContinue") {
			await handleGuildJoinContinue(interaction);
		} else if (
			buttonId
				.toLowerCase()
				.includes("showUniversityNameInputModal".toLowerCase())
		) {
			await handleUniversityNameInputModal(interaction, buttonId);
		} else if (
			buttonId
				.toLowerCase()
				.includes("showOrganizationNameInputModal".toLowerCase())
		) {
			await handleOrganizationNameInputModal(interaction, buttonId);
		} else if (buttonId.includes("universityNameCorrect")) {
			await handleUniversityNameCorrect(interaction, interaction.customId);
		} else if (buttonId.includes("organizationNameCorrect")) {
			await handleOrganizationNameCorrect(interaction);
		} else if (buttonId.includes("organizationNameConfirm")) {
			await handleOrganizationNameConfirm(interaction);
		} else if (buttonId.includes("organizationNameReject")) {
			await handleOrganizationNameReject(interaction, buttonId);
		} else if (buttonId.includes("SelfIntroductionRegisterContinue")) {
			await handleSelfIntroductionRegisterContinue(interaction, buttonId);
		} else if (buttonId === "cancel" || buttonId === "delete") {
			await interaction.message.delete();
		}
	} catch (err) {
		ErrorHandler.handle(err, interaction);
	}
}

module.exports = {
	handleButtonInteraction,
	universityRegister,
	organizationRegister,
};
