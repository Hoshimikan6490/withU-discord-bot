// for using sentry
require('../lib/monitoring/instrument');
const { InteractionType } = require('discord.js');
const { handleSlashCommand } = require('../lib/handlers/commandHandlers');
const { handleButtonInteraction } = require('../lib/handlers/buttonHandlers');
const { handleModalInteraction } = require('../lib/handlers/modalHandlers');
const ErrorHandler = require('../lib/monitoring/errorHandler');
require('dotenv').config({ quiet: true });

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
