// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");

const {
	InteractionType,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
	ApplicationCommandType,
} = require("discord.js");
const fs = require("fs");
const {
	getDatabaseFromSchoolID,
	getDatabaseFromSchoolName,
} = require("../lib/databaseController");
const joinedMemberGuide = require("../lib/joinedMemberGuide");
require("dotenv").config({ quiet: true });

async function sendJoinProcessLog(client, type, howToSet, userId) {
	let memberLogChannelID = process.env.memberLogChannelID;
	let embedTitle, embedDescription, embedColor;

	let guild = await client.guilds.cache.get(process.env.activeGuildID);
	let member = await guild.members.fetch(userId);

	if (type == "universityRegisterFinished") {
		embedTitle = "大学選択を完了しました。（1/2）";
	} else if (type == "organizationRegisterFinished") {
		embedTitle = "組織名登録が完了しました。（1/2）";
	} else if (type == "joinRegisterFinished") {
		embedTitle = "参加登録が完了しました。（2/2）";
	}

	if (type == "universityRegisterFinished") {
		embedDescription = `<@${userId}> さんの大学名を「${howToSet}」に設定しました。`;
	} else if (type == "organizationRegisterFinished") {
		embedDescription = `<@${userId}> さんの組織名を「${howToSet}」に設定しました。`;
	} else if (type == "joinRegisterFinished") {
		embedDescription = `<@${userId}> さんが参加登録を完了させました。登録された名前は「${howToSet}」です。`;
	}

	if (type == "universityRegisterFinished") {
		embedColor = 0x00ffff;
	} else if (type == "organizationRegisterFinished") {
		embedColor = 0xffff00;
	} else if (type == "joinRegisterFinished") {
		embedColor = 0xff0000;
	}

	let embed = new EmbedBuilder()
		.setTitle(embedTitle)
		.setDescription(embedDescription)
		.setThumbnail(member.displayAvatarURL())
		.setColor(embedColor)
		.setTimestamp();

	await client.channels.cache.get(memberLogChannelID).send({ embeds: [embed] });
}

async function universityRegister(client, interaction, customId) {
	// 大学登録処理
	let universityID = customId.split("-")[1];
	let universityInfo = getDatabaseFromSchoolID(universityID);
	let universityName = universityInfo[0].schoolName;

	// エラー処理のために、次の処理への案内用のボタンをここで定義
	let SelfIntroductionRegisterContinue = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`SelfIntroductionRegisterContinue-UI${universityID}`) //自己紹介送信のため、大学IDを引き継ぐ
			.setLabel("続ける")
			.setEmoji("➡️")
			.setStyle(ButtonStyle.Success)
	);

	// ロール追加
	try {
		let guild = await client.guilds.cache.get(process.env.activeGuildID);
		let role = await guild.roles.cache.find(
			(role) => role.name === universityName
		);
		if (!role) {
			// ロールが無い場合は、作成する
			role = await guild.roles.create({
				name: universityName,
				permissions: [],
			});
		}
		let member = await guild.members.fetch(interaction.user.id);

		// 既にロールを持っている場合は、次のガイドに従うように案内する
		if (!member.roles.cache.some((role) => role.name === universityName)) {
			member.roles.add(role);
		} else {
			return interaction.editReply({
				content:
					"⚠️　既に大学選択処理は完了しています。\n次の自己紹介登録へお進みください。",
				components: [SelfIntroductionRegisterContinue],
			});
		}
	} catch (err) {
		Sentry.captureException(err);
		return interaction.editReply({
			content:
				"❌　ロール追加時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
		});
	}

	// 登録画面を無効化
	const channel = await interaction.user.createDM();
	const message = await channel.messages.fetch(interaction.message.id);

	const disabledButtonEmbed = new EmbedBuilder()
		.setTitle(`「${universityInfo[0].schoolName}」を登録しますか？`)
		.setFooter({
			text: "※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。",
		});

	let buttonRow = message.components[0];
	const disabledComponents = buttonRow.components.map((button) =>
		ButtonBuilder.from(button).setDisabled(true)
	);
	const disabledActionRow = new ActionRowBuilder().addComponents(
		disabledComponents
	);

	await message.edit({
		embeds: [disabledButtonEmbed],
		components: [disabledActionRow],
	});

	// ログを残す
	await sendJoinProcessLog(
		client,
		"universityRegisterFinished",
		universityName,
		interaction.user.id
	);

	// 次の処理への誘導表示
	let embed = new EmbedBuilder()
		.setTitle("ご協力ありがとうございます！参加希望が許可されました！")
		.setDescription(
			`あなたの所属大学名を__**${universityName}**__に設定しました！\n\n続いて、自己紹介の入力をお願い致します。これが完了しますと、入室手続きは完了となります。`
		)
		.setFooter({
			text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
		});

	await interaction.editReply({
		embeds: [embed],
		components: [SelfIntroductionRegisterContinue],
	});
}

async function organizationRegister(client, interaction, userId, messageId) {
	// 組織名登録処理
	let organizationName = interaction.message.embeds[0].description
		.split("「")[1]
		.split("」")[0];

	// エラー処理のために、次の処理への案内用のボタンをここで定義
	let SelfIntroductionRegisterContinue = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(`SelfIntroductionRegisterContinue-MI${messageId}`) //自己紹介送信のため、組織名が入ったメッセージIDを引き継ぐ
			.setLabel("続ける")
			.setEmoji("➡️")
			.setStyle(ButtonStyle.Success)
	);

	// ロール追加
	try {
		let guild = await client.guilds.cache.get(process.env.activeGuildID);
		let role = await guild.roles.cache.find(
			(role) => role.name === organizationName
		);
		if (!role) {
			// ロールが無い場合は、作成する
			role = await guild.roles.create({
				name: organizationName,
				permissions: [],
			});
		}
	} catch (err) {
		Sentry.captureException(err);
		return interaction.editReply({
			content:
				"❌　ロール追加時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
		});
	}

	// ログを残す
	await sendJoinProcessLog(
		client,
		"organizationRegisterFinished",
		organizationName,
		userId
	);

	// 次の処理への誘導表示
	let embed = new EmbedBuilder()
		.setTitle("ご協力ありがとうございます！")
		.setDescription(
			`あなたの所属組織名を__**「${organizationName}」**__に設定しました！\n\n続いて、自己紹介の入力をお願い致します。これが完了しますと、入室手続きは完了となります。`
		)
		.setFooter({
			text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
		});

	const user = await client.users.fetch(userId);
	const channel = await user.createDM();
	await channel.send({
		embeds: [embed],
		components: [SelfIntroductionRegisterContinue],
	});
}

module.exports = async (client, interaction) => {
	if (interaction?.type == InteractionType.ApplicationCommand) {
		if (!interaction?.guild) {
			return interaction?.reply({
				content:
					"❌ このBOTはサーバー内でのみ動作します。\nお手数をおかけしますが、サーバー内でご利用ください。",
				flags: MessageFlags.Ephemeral,
			});
		}

		fs.readdir("../commands", (err, files) => {
			if (err) Sentry.captureException(err);
			files.forEach(async (f) => {
				let props = require(`../commands/${f}`);
				let propsJson = props.command.toJSON();

				// commandsフォルダ内のファイルで特にタイプの指定が無ければ、スラッシュコマンドとして指定する。
				if (propsJson.type == undefined) {
					propsJson.type = ApplicationCommandType.ChatInput;
				}

				if (
					interaction.commandName == propsJson.name &&
					interaction.commandType == propsJson.type
				) {
					try {
						return props.run(client, interaction);
					} catch (err) {
						Sentry.captureException(err);
						return interaction?.reply({
							content: `❌ 何らかのエラーが発生しました。`,
							flags: MessageFlags.Ephemeral,
						});
					}
				}
			});
		});
	}

	if (interaction?.type == InteractionType.MessageComponent) {
		try {
			// button 処理
			let buttonId = interaction.customId;
			if (buttonId == "guildJoinContinue") {
				let embed = new EmbedBuilder().setTitle(
					"下のボタンから大学名/組織名を設定してください"
				);

				let userTypeButtons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId("showUniversityNameInputModal")
						.setLabel("大学生として登録する")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId("showOrganizationNameInputModal")
						.setLabel("大学生以外として登録する")
						.setStyle(ButtonStyle.Primary)
				);

				await interaction.reply({
					embeds: [embed],
					components: [userTypeButtons],
				});
				////////////////////////////////////////////////
				// 最初の「続ける」ボタンを無効化
				let [guildJoinContinue, embed1, embed2, embed3] =
					await joinedMemberGuide();

				guildJoinContinue.components[0].setDisabled(true);

				const channel = await interaction.user.createDM();
				const message = await channel.messages.fetch(interaction.message.id);
				await message.edit({
					embeds: [embed1, embed2, embed3],
					components: [guildJoinContinue],
				});
			} else if (
				buttonId
					.toLocaleLowerCase()
					.includes("showUniversityNameInputModal".toLocaleLowerCase())
			) {
				// 大学名入力モーダルを表示
				let modal = new ModalBuilder()
					.setCustomId(
						buttonId == "reShowUniversityNameInputModal"
							? "reAskUniversityName"
							: "askUniversityName"
					)
					.setTitle("あなたが所属する大学名を入力してください。");
				let textInput = new TextInputBuilder()
					.setCustomId("universityNameInput")
					.setLabel("正式名称またはその一部を入力してください。")
					.setPlaceholder("例) 架空野大学")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				let actionRow = new ActionRowBuilder().addComponents(textInput);
				modal.addComponents(actionRow);

				await interaction.showModal(modal);
			} else if (
				buttonId
					.toLocaleLowerCase()
					.includes("showOrganizationNameInputModal".toLocaleLowerCase())
			) {
				// 組織名入力モーダルを表示
				let modal = new ModalBuilder()
					.setCustomId(
						buttonId == "reShowOrganizationNameInputModal"
							? "reAskOrganizationName"
							: "askOrganizationName"
					)
					.setTitle("あなたが所属する組織名を入力してください。");
				let textInput = new TextInputBuilder()
					.setCustomId("organizationNameInput")
					.setLabel("所属している組織の正式名称を入力してください。")
					.setPlaceholder("例) 架空野株式会社")
					.setStyle(TextInputStyle.Short)
					.setRequired(true);

				let actionRow = new ActionRowBuilder().addComponents(textInput);
				modal.addComponents(actionRow);
				await interaction.showModal(modal);
			} else if (buttonId.includes(`universityNameCorrect`)) {
				await interaction.deferReply();
				let customId = interaction.customId;

				await universityRegister(client, interaction, customId);
			} else if (buttonId.includes(`organizationNameCorrect`)) {
				await interaction.deferReply();

				// 組織名の取得
				let organizationName = interaction.message.embeds[0].title
					.split("「")[1]
					.split("」")[0];

				// 管理チャンネルに確認メッセージを送信
				const channel = await client.channels.cache.get(
					process.env.adminChannelID
				);
				let adminConfirmEmbed = new EmbedBuilder()
					.setTitle("新規参加者の登録確認")
					.setDescription(
						`<@${interaction.user.id}>さんが、組織名「${organizationName}」として登録を希望しています。\n\nこの組織名で登録してもよろしいでしょうか？\n\nもし問題がある場合は、以下のボタンを押して登録をキャンセルしてください。`
					)
					.setFooter({
						text: `管理ID: ${interaction.message.id}`,
					})
					.setColor(0x0000ff);
				let adminConfirmButtons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(`organizationNameConfirm-${interaction.user.id}`)
						.setLabel("参加を許可する")
						.setEmoji("✅")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId(`organizationNameReject-${interaction.user.id}`)
						.setLabel("参加を拒否する")
						.setEmoji("⛔")
						.setStyle(ButtonStyle.Danger)
				);
				await channel.send({
					embeds: [adminConfirmEmbed],
					components: [adminConfirmButtons],
				});

				// 登録メッセージのボタンを無効化
				let buttonRow = interaction.message.components[0];
				const disabledComponents = buttonRow.components.map((button) =>
					ButtonBuilder.from(button).setDisabled(true)
				);
				const disabledActionRow = new ActionRowBuilder().addComponents(
					disabledComponents
				);
				const dmChannel = await interaction.user.createDM();
				const message = await dmChannel.messages.fetch(interaction.message.id);
				await message.edit({
					components: [disabledActionRow],
				});

				// 参加者に確認待ちである旨を伝える
				let waitForAdminConfirmEmbed = new EmbedBuilder()
					.setTitle("サーバー管理者の参加許可を待機中…")
					.setDescription(
						"サーバー管理者に、あなたが参加希望である旨を報告しました。参加可否の判断が出るまで、しばらくお待ちください。判断が出次第、このDMでお知らせします。\n\nなお、管理者の都合により、判断に時間がかかる場合がありますので、ご了承ください。"
					)
					.setColor(0xffff00);
				return interaction.editReply({
					embeds: [waitForAdminConfirmEmbed],
				});
			} else if (buttonId.includes("organizationNameConfirm")) {
				let messageId =
					interaction.message.embeds[0].footer.text.split("管理ID: ")[1];

				// 元メッセージのボタンの無効化
				let buttonRow = interaction.message.components[0];
				const disabledComponents = buttonRow.components.map((button) =>
					ButtonBuilder.from(button).setDisabled(true)
				);
				const disabledActionRow = new ActionRowBuilder().addComponents(
					disabledComponents
				);
				await interaction.message.edit({
					components: [disabledActionRow],
				});
				await interaction.reply("✅ 参加を許可しました。");

				// 参加希望ユーザーのユーザーIDを取得
				let userId = interaction.message.embeds[0].description
					.split("<@")[1]
					.split(">")[0];

				await organizationRegister(client, interaction, userId, messageId);
			} else if (buttonId.includes("organizationNameReject")) {
				const userId = buttonId.split("-")[1];
				const user = await client.users.fetch(userId);
				const channel = await user.createDM();

				// 元メッセージのボタンの無効化
				let buttonRow = interaction.message.components[0];
				const disabledComponents = buttonRow.components.map((button) =>
					ButtonBuilder.from(button).setDisabled(true)
				);
				const disabledActionRow = new ActionRowBuilder().addComponents(
					disabledComponents
				);
				await interaction.message.edit({
					components: [disabledActionRow],
				});
				await interaction.reply("❌ 参加を拒否しました。");

				// 参加拒否のメッセージを送信
				let rejectEmbed = new EmbedBuilder()
					.setTitle("❌ 参加が拒否されました")
					.setDescription(
						`サーバー管理者により、参加が拒否されました。この判断が誤っている場合は、サーバー管理者に直接お問い合わせください。`
					)
					.setColor(0xff0000);
				return channel.send({
					embeds: [rejectEmbed],
				});
			} else if (buttonId.includes("SelfIntroductionRegisterContinue")) {
				// 大学名が引き継がれていない場合は、組織登録として扱う
				if (buttonId.includes("MI")) {
					const messageId = buttonId.split("-MI")[1];
					const channel = await interaction.user.createDM();
					const message = await channel.messages.fetch(messageId);
					let organizationName = message.content
						? message.content.split("「")[1].split("」")[0]
						: message.embeds[0].title.split("「")[1].split("」")[0];

					// 自己紹介登録のモーダル表示
					let modal = new ModalBuilder()
						.setCustomId(`userSelfIntroductionModal`)
						.setTitle("自己紹介をご入力ください。");
					let nameInput = new TextInputBuilder()
						.setCustomId("userName")
						.setLabel("本名(フルネーム)を空白無しで、入力してください。")
						.setPlaceholder("架空野太郎")
						.setStyle(TextInputStyle.Short)
						.setRequired(true);
					let organizationNameInput = new TextInputBuilder()
						.setCustomId("organizationName")
						.setLabel(
							"絶対に変更しないでください！変更してしまった場合は灰色の文字をそのまま入力してください！"
						)
						.setValue(organizationName)
						.setPlaceholder(organizationName)
						.setStyle(TextInputStyle.Short)
						.setRequired(true);
					let organizationRoleInput = new TextInputBuilder()
						.setCustomId("organizationRole")
						.setLabel(
							`「${organizationName}」での役職や部署などを入力してください。(任意)`
						)
						.setStyle(TextInputStyle.Short)
						.setRequired(false);
					let organizationDescriptionInput = new TextInputBuilder()
						.setCustomId("organizationDescription")
						.setLabel(
							`「${organizationName}」について、簡単に説明してください。`
						)
						.setPlaceholder("業務分野や活動内容など")
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true);
					let shortMessageInput = new TextInputBuilder()
						.setCustomId("userShortMessage")
						.setLabel("何か一言どうぞ！")
						.setPlaceholder(
							"以上の内容で書ききれなかった事や、ご挨拶などをどうぞ"
						)
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true);

					let actionRow1 = new ActionRowBuilder().addComponents(nameInput);
					let actionRow2 = new ActionRowBuilder().addComponents(
						organizationNameInput
					);
					let actionRow3 = new ActionRowBuilder().addComponents(
						organizationRoleInput
					);
					let actionRow4 = new ActionRowBuilder().addComponents(
						organizationDescriptionInput
					);
					let actionRow5 = new ActionRowBuilder().addComponents(
						shortMessageInput
					);
					modal.addComponents(
						actionRow1,
						actionRow2,
						actionRow3,
						actionRow4,
						actionRow5
					);

					await interaction.showModal(modal);
				} else if (buttonId.includes("UI")) {
					// 引き継ぐ大学IDを取得
					let universityID = buttonId.split("-UI")[1];

					// 自己紹介登録のモーダル表示
					let modal = new ModalBuilder()
						.setCustomId(`userSelfIntroductionModal-${universityID}`)
						.setTitle("自己紹介をご入力ください。");
					let nameInput = new TextInputBuilder()
						.setCustomId("userName")
						.setLabel("本名(フルネーム)を空白無しで、入力してください。")
						.setPlaceholder("架空野太郎")
						.setStyle(TextInputStyle.Short)
						.setRequired(true);
					let gradeInput = new TextInputBuilder()
						.setCustomId("userGrade")
						.setLabel(
							"現在の学年を入力してください。"
						)
						.setPlaceholder("大学1年/専門学校1年/広報部など")
						.setStyle(TextInputStyle.Short)
						.setRequired(true);
					let clubInput = new TextInputBuilder()
						.setCustomId("userClub")
						.setLabel(
							"何か学校のサークルなどに所属してる場合はその名前を入力してください。"
						)
						.setPlaceholder("野球部/マンガ研究会など")
						.setStyle(TextInputStyle.Short)
						.setRequired(false);
					let shortMessageInput = new TextInputBuilder()
						.setCustomId("userShortMessage")
						.setLabel("何か一言どうぞ！")
						.setPlaceholder(
							"以上の内容で書ききれなかった事や、ご挨拶などをどうぞ"
						)
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true);

					let actionRow1 = new ActionRowBuilder().addComponents(nameInput);
					let actionRow2 = new ActionRowBuilder().addComponents(gradeInput);
					let actionRow3 = new ActionRowBuilder().addComponents(clubInput);
					let actionRow4 = new ActionRowBuilder().addComponents(
						shortMessageInput
					);
					modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

					await interaction.showModal(modal);
				}
			} else if (buttonId == "cancel" || buttonId == "delete") {
				// キャンセル処理
				await interaction.message.delete();
			}
		} catch (err) {
			Sentry.captureException(err);
		}
	}

	if (interaction?.type == InteractionType.ModalSubmit) {
		try {
			let modalId = interaction.customId;
			if (
				modalId.toLowerCase().includes("askUniversityName".toLocaleLowerCase())
			) {
				let universityNameInput = interaction.fields.getTextInputValue(
					"universityNameInput"
				);

				let universityInfo = getDatabaseFromSchoolName(universityNameInput);

				if (universityInfo.length == 0) {
					await interaction.reply({
						content:
							"❌　大学名が見つかりませんでした。もう一度お試しください。",
						flags: MessageFlags.Ephemeral,
					});
				} else {
					let universitySelectButton = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setLabel("この大学で登録する")
							.setCustomId(
								`universityNameCorrect-${universityInfo[0].schoolID}`
							)
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setLabel("この大学で登録しない")
							.setCustomId("reShowUniversityNameInputModal")
							.setStyle(ButtonStyle.Secondary)
					);

					let embed = new EmbedBuilder()
						.setTitle(`「${universityInfo[0].schoolName}」を登録しますか？`)
						.setFooter({
							text: "※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。",
						});

					await interaction.reply({
						embeds: [embed],
						components: [universitySelectButton],
					});
					////////////////////////////////////////////////
					// 大学名の質問モーダルの表示が２回目以降の場合は、前のメッセージを削除
					// 最初の場合は、ボタンを無効化
					if (modalId == "reAskUniversityName") {
						await interaction.message.delete();
					} else {
						let editMessageEmbed = new EmbedBuilder().setTitle(
							"下のボタンから大学名/組織名を設定してください"
						);

						// 元メッセージのボタンの無効化
						const channel = await interaction.user.createDM();
						const message = await channel.messages.fetch(
							interaction.message.id
						);
						let buttonRow = message.components[0];
						const disabledComponents = buttonRow.components.map((button) =>
							ButtonBuilder.from(button).setDisabled(true)
						);
						const disabledActionRow = new ActionRowBuilder().addComponents(
							disabledComponents
						);
						await message.edit({
							embeds: [editMessageEmbed],
							components: [disabledActionRow],
						});
					}
				}
			} else if (
				modalId
					.toLowerCase()
					.includes("askOrganizationName".toLocaleLowerCase())
			) {
				let organizationNameInput = interaction.fields.getTextInputValue(
					"organizationNameInput"
				);

				let organizationSelectButton = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel("この組織名で登録する")
						.setCustomId("organizationNameCorrect")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setLabel("この組織名で登録しない")
						.setCustomId("reShowOrganizationNameInputModal")
						.setStyle(ButtonStyle.Secondary)
				);

				let embed = new EmbedBuilder()
					.setTitle(`「${organizationNameInput}」を登録しますか？`)
					.setFooter({
						text: "※組織名を誤って入力してしまった場合は、「この組織名で登録しない」ボタンを押して再度お試しください。",
					});

				await interaction.reply({
					embeds: [embed],
					components: [organizationSelectButton],
				});
				////////////////////////////////////////////////
				// 組織名の質問モーダルの表示が２回目以降の場合は、前のメッセージを削除
				// 最初の場合は、ボタンを無効化
				if (modalId == "reAskOrganizationName") {
					await interaction.message.delete();
				} else {
					let editMessageEmbed = new EmbedBuilder().setTitle(
						"下のボタンから大学名/組織名を設定してください"
					);

					// 元メッセージのボタンの無効化
					const channel = await interaction.user.createDM();
					const message = await channel.messages.fetch(interaction.message.id);
					let buttonRow = message.components[0];
					const disabledComponents = buttonRow.components.map((button) =>
						ButtonBuilder.from(button).setDisabled(true)
					);
					const disabledActionRow = new ActionRowBuilder().addComponents(
						disabledComponents
					);
					await message.edit({
						embeds: [editMessageEmbed],
						components: [disabledActionRow],
					});
				}
			} else if (modalId.includes("userSelfIntroductionModal")) {
				await interaction.deferReply();
				try {
					// ユーザ名の取得
					let userName = interaction.fields.getTextInputValue("userName");
					// ユーザー名の設定
					let guild = await client.guilds.cache.get(process.env.activeGuildID);
					let member = await guild.members.fetch(interaction.user.id);
					await member.setNickname(userName);

					let description;
					if (modalId == "userSelfIntroductionModal") {
						// 組織名が引き継がれていない場合は、組織登録として扱う
						let organizationName =
							interaction.fields.getTextInputValue("organizationName");
						let organizationRole =
							interaction.fields.getTextInputValue("organizationRole");
						let organizationDescription = interaction.fields.getTextInputValue(
							"organizationDescription"
						);
						let userShortMessage =
							interaction.fields.getTextInputValue("userShortMessage");

						description = `- 所属組織名：\n\`\`\`\n${organizationName}\n\`\`\`\n`;
						organizationRole
							? (description += `- 役職や部署：\n\`\`\`\n${organizationRole}\n\`\`\`\n`)
							: null;
						description += `- 所属組織について：\n\`\`\`\n${organizationDescription}\n\`\`\`\n- 一言：\n\`\`\`\n${userShortMessage}\n\`\`\`\n`;
					} else {
						// 自己紹介モーダル送信後処理
						let userGrade = interaction.fields.getTextInputValue("userGrade");
						let userClub = interaction.fields.getTextInputValue("userClub");
						let userShortMessage =
							interaction.fields.getTextInputValue("userShortMessage");
						// 引き継がれた大学IDを取得
						let universityID = modalId.split("-")[1];

						// 大学名を取得
						let universityInfo = getDatabaseFromSchoolID(universityID);
						let universityName = universityInfo[0].schoolName;

						// 自己紹介説明欄の設定
						description = `- 所属大学：\n\`\`\`\n${universityName}\n\`\`\`\n- 学年/役職：\n\`\`\`\n${userGrade}\n\`\`\`\n`;
						if (userClub) {
							description += `- 所属サークル：\n\`\`\`\n${userClub}\n\`\`\`\n`;
						}
						description += `- 一言：\n\`\`\`\n${userShortMessage}\n\`\`\`\n`;
					}

					// 自己紹介埋め込み色の設定
					var letters = "0123456789ABCDEF";
					var color = "0x";
					for (var i = 0; i < 6; i++) {
						color += letters[Math.floor(Math.random() * 16)];
					}

					// 自己紹介文の送信
					let embed = new EmbedBuilder()
						.setTitle(`${userName}さんの自己紹介`)
						.setDescription(description)
						.setColor(Number(color))
						.setThumbnail(member.displayAvatarURL())
						.setTimestamp();
					client.channels.cache
						.get(process.env.selfIntroductionChannelID)
						.send({
							content: `<@${interaction.user.id}>`,
							embeds: [embed],
						});

					// メンバーロールを付与
					await member.roles.add(process.env.memberRoleID);

					// 自己紹介入力フォームを開くボタンをdisableにして、次の処理への誘導表示
					const channel = await interaction.user.createDM();
					const message = await channel.messages.fetch(interaction.message.id);
					// 元メッセージのボタンの無効化
					let buttonRow = message.components[0];
					const disabledComponents = buttonRow.components.map((button) =>
						ButtonBuilder.from(button).setDisabled(true)
					);
					const disabledActionRow = new ActionRowBuilder().addComponents(
						disabledComponents
					);
					await message.edit({
						components: [disabledActionRow],
					});

					// 完了した旨をDMに送信
					let finishedEmbed = new EmbedBuilder()
						.setTitle("入室手続きが完了！")
						.setDescription(
							"入室手続きが完了しました。サーバー内の各チャンネルの使い方は、チャンネルトピックを参考にしながらご利用ください。ご不明な点等がございましたら、雑談チャンネルや運営までお問い合わせください。"
						)
						.setColor(0xff0000)
						.setTimestamp();
					await interaction.editReply({
						embeds: [finishedEmbed],
					});

					// ログを残す
					return sendJoinProcessLog(
						client,
						"joinRegisterFinished",
						userName,
						interaction.user.id
					);
				} catch (err) {
					Sentry.captureException(err);
					return interaction.editReply({
						content:
							"❌　自己紹介の登録時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
					});
				}
			}
		} catch (err) {
			Sentry.captureException(err);
		}
	}
};
