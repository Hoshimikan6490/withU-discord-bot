const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const fs = require("fs");

const url_check_api = process.env["url_check_api"];

module.exports = async (client, message) => {
  try {
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

    //メッセージ展開
    const MESSAGE_URL_REGEX =
      /https?:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
    const matches = MESSAGE_URL_REGEX.exec(message.content);
    if (matches) {
      const [url, guildId, channelId, messageId] = matches;
      try {
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
          message.delete();
        }
      } catch (err) {
        return;
      }
    }
  } catch (err) {
    err.id = "messageCreate";
    const errorNotification = require("../errorFunction.js");
    errorNotification(client, message, err);
  }
};
