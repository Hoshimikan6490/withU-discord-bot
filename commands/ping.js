// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("BotのPingを測定します。"),

  run: async (client, interaction) => {
    try {
      await interaction.reply({
        content: "🔄️　計測中…",
      });

      return interaction.editReply(
        `# Ping計測結果
        - WebsocketのPing: \`${Math.abs(client.ws.ping)}ms\`.
        - APIのLatency: \`${
          sent.createdTimestamp - interaction.createdTimestamp
        }ms\`.`
      );
    } catch (err) {
      Sentry.captureException(err);
    }
  },
};
