// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
} = require("discord.js");
require("dotenv").config({ quiet: true });

module.exports = async (client, message) => {
	if (message.author.bot) return;

	let myPermissions = message.guild.members.me
		.permissionsIn(message.channel)
		.toArray();
	let conditions = [
		"ViewChannel",
		"SendMessages",
		"ManageMessages",
		"EmbedLinks",
		"AttachFiles",
	];
	for (const key in conditions) {
		if (!myPermissions.includes(conditions[key])) {
			return;
		}
	}

	try {
		const activeGuildID = process.env.activeGuildID;
		if (activeGuildID == message.guild.id) {
			//メッセージ展開
			const MESSAGE_URL_REGEX =
				/https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
			const matches = MESSAGE_URL_REGEX.exec(message.content);
			if (matches) {
				const [url, guildId, channelId, messageId] = matches;

				const channel = await client.channels.fetch(channelId);
				const fetchedMessage = await channel.messages.fetch(messageId);

				let buttons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel("メッセージを見る")
						.setURL(fetchedMessage.url)
						.setStyle(ButtonStyle.Link),
					new ButtonBuilder()
						.setCustomId("cancel")
						.setEmoji("🗑️")
						.setStyle(ButtonStyle.Secondary)
				);

				message.channel.send({
					embeds: [
						{
							description: fetchedMessage.content,
							author: {
								name: fetchedMessage.author.tag,
								iconURL: fetchedMessage.author.displayAvatarURL(),
							},
							color: 0x4d4df7,
							timestamp: new Date(fetchedMessage.createdTimestamp),
						},
					],
					components: [buttons],
				});

				//メッセージリンクだけが投稿された場合の処理
				if (url == message.content) {
					message.delete().catch((err) => {});
				}
			}

			// アナウンスチャンネルのAutoPublish
			if (message.channel.type === ChannelType.GuildAnnouncement) {
				// メッセージを「公開」にする
				if (message.crosspostable) {
					message
						.crosspost()
						.then(() => {
							message.react("✅");

							setTimeout(async () => {
								let botReactions = message.reactions.cache.filter((reaction) =>
									reaction.users.cache.has(client.user.id)
								);

								try {
									for (let reaction of botReactions.values()) {
										await reaction.users.remove(client.user.id);
									}
								} catch (err) {
									Sentry.captureException(err);
								}
							}, 5000);
						}) //メッセージを公開できたらリアクションをする
						.catch((err) => {
							Sentry.captureException(err);
						});
				} else {
					message.react("❌"); //Botに権限がない場合
				}
			}
		}
	} catch (err) {
		Sentry.captureException(err);
	}
};
