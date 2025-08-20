// for using sentry
require("../lib/instrument");
const { InteractionType } = require("discord.js");
const { handleSlashCommand } = require("../lib/commandHandlers");
const { handleButtonInteraction } = require("../lib/buttonHandlers");
const { handleModalInteraction } = require("../lib/modalHandlers");
const ErrorHandler = require("../lib/errorHandler");
require("dotenv").config({ quiet: true });

module.exports = async (client, interaction) => {
	try {
		if (interaction?.type === InteractionType.ApplicationCommand) {
			await handleSlashCommand(client, interaction);
		} else if (interaction?.type === InteractionType.MessageComponent) {
			await handleButtonInteraction(client, interaction);
		} else if (interaction?.type === InteractionType.ModalSubmit) {
			await handleModalInteraction(client, interaction);
		}
	} catch (err) {
		ErrorHandler.handle(err, interaction);
	}
};
