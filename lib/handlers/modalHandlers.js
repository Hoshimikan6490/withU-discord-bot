// Modal interaction handlers for the Discord BOT
const { MessageFlags } = require('discord.js');
const { getDatabaseFromSchoolName } = require('../database/databaseController');
const {
	createStandardEmbed,
	createConfirmationButtons,
	disableMessageButtons,
	fetchGuildAndMember,
} = require('../utils/discordUtils');
const {
	sendJoinProcessLog,
	buildSelfIntroductionDescription,
	postSelfIntroduction,
} = require('../utils/registrationUtils');
const ErrorHandler = require('../monitoring/errorHandler');
const {
	ERROR_MESSAGES,
	EMBED_TITLES,
	EMBED_COLORS,
	UI_LABELS,
} = require('../config/constants');

/**
 * Handles university name modal submission
 */
async function handleUniversityNameModal(interaction, modalId) {
	const universityNameInput = interaction.fields.getTextInputValue(
		'universityNameInput'
	);
	const universityInfo = getDatabaseFromSchoolName(universityNameInput);

	if (universityInfo.length === 0) {
		return interaction.reply({
			content: ERROR_MESSAGES.UNIVERSITY_NOT_FOUND,
			flags: MessageFlags.Ephemeral,
		});
	}

	const universitySelectButton = createConfirmationButtons(
		`universityNameCorrect-${universityInfo[0].schoolID}`,
		'reShowUniversityNameInputModal',
		UI_LABELS.CONFIRM_UNIVERSITY_BUTTON,
		UI_LABELS.REJECT_UNIVERSITY_BUTTON
	);

	const embed = createStandardEmbed(
		`「${universityInfo[0].schoolName}」を登録しますか？`,
		null,
		EMBED_COLORS.INFO,
		{
			footer: {
				text: '※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。',
			},
		}
	);

	await interaction.reply({
		embeds: [embed],
		components: [universitySelectButton],
	});

	// Handle previous message cleanup
	if (modalId === 'reAskUniversityName') {
		await interaction.message.delete();
	} else {
		await disablePreviousMessage(
			interaction,
			'下のボタンから大学名/組織名を設定してください'
		);
	}
}

/**
 * Handles organization name modal submission
 */
async function handleOrganizationNameModal(interaction, modalId) {
	const organizationNameInput = interaction.fields.getTextInputValue(
		'organizationNameInput'
	);

	const organizationSelectButton = createConfirmationButtons(
		'organizationNameCorrect',
		'reShowOrganizationNameInputModal',
		UI_LABELS.CONFIRM_ORGANIZATION_BUTTON,
		UI_LABELS.REJECT_ORGANIZATION_BUTTON
	);

	const embed = createStandardEmbed(
		`「${organizationNameInput}」を登録しますか？`,
		null,
		EMBED_COLORS.INFO,
		{
			footer: {
				text: '※組織名を誤って入力してしまった場合は、「この組織名で登録しない」ボタンを押して再度お試しください。',
			},
		}
	);

	await interaction.reply({
		embeds: [embed],
		components: [organizationSelectButton],
	});

	// Handle previous message cleanup
	if (modalId === 'reAskOrganizationName') {
		await interaction.message.delete();
	} else {
		await disablePreviousMessage(
			interaction,
			'下のボタンから大学名/組織名を設定してください'
		);
	}
}

/**
 * Handles self-introduction modal submission
 */
async function handleSelfIntroductionModal(interaction, modalId) {
	await interaction.deferReply();

	try {
		// Set user nickname
		const userName = interaction.fields.getTextInputValue('userName');
		const { guild, member } = await fetchGuildAndMember(
			interaction.client,
			interaction.user.id
		);

		await member.setNickname(userName);

		// Build description based on user type
		const description = buildSelfIntroductionDescription(
			interaction.fields,
			modalId
		);

		// Post self-introduction to channel
		await postSelfIntroduction(
			interaction.client,
			userName,
			description,
			interaction.user.id,
			member.displayAvatarURL()
		);

		// Add member role
		await member.roles.add(process.env.memberRoleID);

		// Disable the continue button
		const channel = await interaction.user.createDM();
		const message = await channel.messages.fetch(interaction.message.id);
		const disabledActionRows = disableMessageButtons(message);

		await message.edit({
			components: disabledActionRows,
		});

		// Send completion message
		const finishedEmbed = createStandardEmbed(
			EMBED_TITLES.REGISTRATION_COMPLETED,
			'入室手続きが完了しました。サーバー内の各チャンネルの使い方は、チャンネルトピックを参考にしながらご利用ください。ご不明な点等がございましたら、雑談チャンネルや運営までお問い合わせください。',
			EMBED_COLORS.JOIN_REGISTER,
			{ timestamp: true }
		);

		await interaction.editReply({
			embeds: [finishedEmbed],
		});

		// Log the completion
		return sendJoinProcessLog(
			interaction.client,
			'joinRegisterFinished',
			userName,
			interaction.user.id
		);
	} catch (err) {
		return ErrorHandler.handleSelfIntroductionError(err, interaction);
	}
}

/**
 * Helper function to disable previous message buttons
 */
async function disablePreviousMessage(interaction, embedTitle) {
	const channel = await interaction.user.createDM();
	const message = await channel.messages.fetch(interaction.message.id);

	const editMessageEmbed = createStandardEmbed(embedTitle, null);
	const disabledActionRows = disableMessageButtons(message);

	await message.edit({
		embeds: [editMessageEmbed],
		components: disabledActionRows,
	});
}

/**
 * Main modal interaction handler
 */
async function handleModalInteraction(client, interaction) {
	const modalId = interaction.customId;

	try {
		if (modalId.toLowerCase().includes('askUniversityName'.toLowerCase())) {
			await handleUniversityNameModal(interaction, modalId);
		} else if (
			modalId.toLowerCase().includes('askOrganizationName'.toLowerCase())
		) {
			await handleOrganizationNameModal(interaction, modalId);
		} else if (modalId.includes('userSelfIntroductionModal')) {
			await handleSelfIntroductionModal(interaction, modalId);
		}
	} catch (err) {
		ErrorHandler.handle(err, interaction);
	}
}

module.exports = {
	handleModalInteraction,
};
