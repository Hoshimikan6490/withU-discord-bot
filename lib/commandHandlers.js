// Command interaction handlers for the Discord bot
const fs = require("fs");
const { ApplicationCommandType, MessageFlags } = require("discord.js");
const ErrorHandler = require("./errorHandler");
const { ERROR_MESSAGES } = require("./constants");

/**
 * Handles slash command interactions
 */
async function handleSlashCommand(client, interaction) {
	if (!interaction?.guild) {
		return interaction?.reply({
			content: ERROR_MESSAGES.SERVER_ONLY,
			flags: MessageFlags.Ephemeral,
		});
	}

	// Read commands from directory and execute matching command
	fs.readdir("./commands", (err, files) => {
		if (err) {
			ErrorHandler.logError(err, "reading commands directory");
			return;
		}

		files.forEach(async (file) => {
			if (!file.endsWith(".js")) return;

			try {
				const props = require(`../commands/${file}`);
				const propsJson = props.command.toJSON();

				// Set default type if not specified
				if (propsJson.type == undefined) {
					propsJson.type = ApplicationCommandType.ChatInput;
				}

				if (
					interaction.commandName === propsJson.name &&
					interaction.commandType === propsJson.type
				) {
					return props.run(client, interaction);
				}
			} catch (commandErr) {
				ErrorHandler.handleCommandError(commandErr, interaction);
			}
		});
	});
}

module.exports = {
	handleSlashCommand,
};