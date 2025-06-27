// for using sentry
require("../lib/instrument");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AuditLogEvent,
  PermissionsBitField,
} = require("discord.js");
const Sentry = require("@sentry/node");
require("dotenv").config({ quiet: true });

module.exports = async function leaveFromUnknownServer(client, guild) {
  try {
    if (guild.id != process.env.activeGuildID) {
      //招待した人にDM
      const button = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("サポートサーバーに参加する")
          .setURL(process.env.supportServer),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel(`招待されたサーバー: 「${guild.name}」`)
          .setCustomId("disabled")
          .setDisabled(true)
      );

      let DMuser;
      if (
        guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)
      ) {
        const fetchedLogs = await guild.fetchAuditLogs({
          type: AuditLogEvent.BotAdd,
          limit: 1,
        });
        const inviterInfo = fetchedLogs.entries.first().executor;
        let inviterId = inviterInfo.id;
        DMuser = await client.users.fetch(inviterId);
      } else {
        let owner_id = guild.ownerId;
        DMuser = await client.users.fetch(owner_id);
      }

      let embed = new EmbedBuilder()
        .setTitle("⚠️ 重要なお知らせ")
        .setDescription(
          `大変申し訳ございません。本BOTはサーバー専属で稼働しており、許可されたサーバー以外のサーバーへの参加は出来ません。\n本BOTに関して、ご不明な点や問題等が発生した場合は、botが所属しているサーバーの管理者か以下のボタンよりお問い合わせください。`
        )
        .setColor(0xff0000)
        .setFooter({ text: `DMで失礼します。` });
      (await DMuser).send({ embeds: [embed], components: [button] });

      //退出するコード
      client.guilds.cache.get(guild.id).leave();
    }
  } catch (err) {
    Sentry.captureException(err);
  }
};
