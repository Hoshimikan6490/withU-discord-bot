const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, UI_LABELS, EMOJIS } = require("../config/constants");

/**
 * Creates a standard embed with common styling
 * @param {string} title - The embed title
 * @param {string} description - The embed description
 * @param {number} color - The embed color (optional)
 * @param {Object} options - Additional options (footer, thumbnail, timestamp)
 * @returns {EmbedBuilder} Configured embed builder
 */
function createStandardEmbed(title, description, color = EMBED_COLORS.INFO, options = {}) {
	const embed = new EmbedBuilder()
		.setTitle(title)
		.setDescription(description)
		.setColor(color);

	if (options.footer) {
		embed.setFooter(options.footer);
	}

	if (options.thumbnail) {
		embed.setThumbnail(options.thumbnail);
	}

	if (options.timestamp) {
		embed.setTimestamp();
	}

	return embed;
}

/**
 * Creates a continue button with standard styling
 * @param {string} customId - The custom ID for the button
 * @param {string} label - The button label (optional)
 * @returns {ActionRowBuilder} Action row with continue button
 */
function createContinueButton(customId, label = UI_LABELS.CONTINUE_BUTTON) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(customId)
			.setLabel(label)
			.setEmoji(EMOJIS.ARROW_RIGHT)
			.setStyle(ButtonStyle.Success)
	);
}

/**
 * Creates approval/rejection buttons for admin actions
 * @param {string} approveId - Custom ID for approve button
 * @param {string} rejectId - Custom ID for reject button
 * @returns {ActionRowBuilder} Action row with approval buttons
 */
function createApprovalButtons(approveId, rejectId) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(approveId)
			.setLabel(UI_LABELS.APPROVE_BUTTON)
			.setEmoji(EMOJIS.CHECK_MARK)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(rejectId)
			.setLabel(UI_LABELS.REJECT_BUTTON)
			.setEmoji(EMOJIS.STOP_SIGN)
			.setStyle(ButtonStyle.Danger)
	);
}

/**
 * Creates confirmation buttons for user choices
 * @param {string} confirmId - Custom ID for confirm button
 * @param {string} rejectId - Custom ID for reject button
 * @param {string} confirmLabel - Label for confirm button
 * @param {string} rejectLabel - Label for reject button
 * @returns {ActionRowBuilder} Action row with confirmation buttons
 */
function createConfirmationButtons(confirmId, rejectId, confirmLabel, rejectLabel) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId(confirmId)
			.setLabel(confirmLabel)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(rejectId)
			.setLabel(rejectLabel)
			.setStyle(ButtonStyle.Secondary)
	);
}

/**
 * Disables all buttons in a message's components
 * @param {Object} message - The Discord message object
 * @returns {Array} Array of disabled action rows
 */
function disableMessageButtons(message) {
	return message.components.map(actionRow => {
		const disabledComponents = actionRow.components.map(button =>
			ButtonBuilder.from(button).setDisabled(true)
		);
		return new ActionRowBuilder().addComponents(disabledComponents);
	});
}

/**
 * Fetches guild and member safely with error handling
 * @param {Object} client - Discord client
 * @param {string} userId - User ID to fetch
 * @returns {Object} Object containing guild and member
 */
async function fetchGuildAndMember(client, userId) {
	const guild = await client.guilds.cache.get(process.env.activeGuildID);
	const member = await guild.members.fetch(userId);
	return { guild, member };
}

/**
 * Generates a random hex color for embeds
 * @returns {number} Random color value
 */
function generateRandomColor() {
	const letters = "0123456789ABCDEF";
	let color = "0x";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return Number(color);
}

/**
 * Creates user type selection buttons
 * @returns {ActionRowBuilder} Action row with user type buttons
 */
function createUserTypeButtons() {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("showUniversityNameInputModal")
			.setLabel(UI_LABELS.UNIVERSITY_REGISTER_BUTTON)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId("showOrganizationNameInputModal")
			.setLabel(UI_LABELS.ORGANIZATION_REGISTER_BUTTON)
			.setStyle(ButtonStyle.Primary)
	);
}

module.exports = {
	createStandardEmbed,
	createContinueButton,
	createApprovalButtons,
	createConfirmationButtons,
	disableMessageButtons,
	fetchGuildAndMember,
	generateRandomColor,
	createUserTypeButtons,
};