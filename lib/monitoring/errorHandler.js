const Sentry = require("@sentry/node");
const { MessageFlags } = require("discord.js");
const { ERROR_MESSAGES } = require("../config/constants");

/**
 * Centralized error handler for the Discord BOT
 * Logs errors to Sentry and provides user-friendly error responses
 */
class ErrorHandler {
	/**
	 * Handles and logs an error, optionally responding to an interaction
	 * @param {Error} error - The error to handle
	 * @param {Object} interaction - Discord interaction (optional)
	 * @param {string} userMessage - Custom user-facing error message (optional)
	 * @param {boolean} ephemeral - Whether the error response should be ephemeral
	 */
	static async handle(
		error,
		interaction = null,
		userMessage = ERROR_MESSAGES.GENERIC_ERROR,
		ephemeral = true
	) {
		// Log to Sentry
		Sentry.captureException(error);

		// Log to console for debugging
		console.error("Error occurred:", error);

		// Respond to user if interaction is provided
		if (interaction) {
			const response = {
				content: userMessage,
				flags: ephemeral ? MessageFlags.Ephemeral : undefined,
			};

			try {
				if (interaction.deferred || interaction.replied) {
					await interaction.editReply(response);
				} else {
					await interaction.reply(response);
				}
			} catch (replyError) {
				console.error("Failed to reply to interaction:", replyError);
				Sentry.captureException(replyError);
			}
		}
	}

	/**
	 * Handles role addition errors specifically
	 * @param {Error} error - The error to handle
	 * @param {Object} interaction - Discord interaction
	 */
	static async handleRoleError(error, interaction) {
		await this.handle(error, interaction, ERROR_MESSAGES.ROLE_ADD_ERROR);
	}

	/**
	 * Handles self-introduction registration errors specifically
	 * @param {Error} error - The error to handle
	 * @param {Object} interaction - Discord interaction
	 */
	static async handleSelfIntroductionError(error, interaction) {
		await this.handle(
			error,
			interaction,
			ERROR_MESSAGES.SELF_INTRODUCTION_ERROR
		);
	}

	/**
	 * Logs an error without responding to user (for background operations)
	 * @param {Error} error - The error to handle
	 * @param {string} context - Context where the error occurred
	 */
	static logError(error, context = "Unknown context") {
		Sentry.captureException(error);
		console.error(`Error in ${context}:`, error);
	}

	/**
	 * Handles command execution errors
	 * @param {Error} error - The error to handle
	 * @param {Object} interaction - Discord interaction
	 */
	static async handleCommandError(error, interaction) {
		await this.handle(error, interaction, ERROR_MESSAGES.GENERIC_ERROR, true);
	}
}

module.exports = ErrorHandler;
