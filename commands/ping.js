// for using sentry
require("../lib/instrument");
const { SlashCommandBuilder } = require("discord.js");
const ErrorHandler = require("../lib/errorHandler");

module.exports = {
	command: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("BotのPingを測定します。"),

	run: async (client, interaction) => {
		try {
			let sent = await interaction.reply({
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
			ErrorHandler.handle(err, interaction);
		}
	},
};
