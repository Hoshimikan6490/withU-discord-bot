const { EmbedBuilder } = require("discord.js");
const { 
	fetchGuildAndMember,
	createStandardEmbed,
	generateRandomColor 
} = require("./discordUtils");
const { 
	EMBED_COLORS, 
	EMBED_TITLES,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES 
} = require("../config/constants");
const ErrorHandler = require("../monitoring/errorHandler");

/**
 * Sends a log message for join process events
 * @param {Object} client - Discord client
 * @param {string} type - Type of registration event
 * @param {string} howToSet - What was set (university name, organization name, user name)
 * @param {string} userId - User ID
 */
async function sendJoinProcessLog(client, type, howToSet, userId) {
	try {
		const memberLogChannelID = process.env.memberLogChannelID;
		const { guild, member } = await fetchGuildAndMember(client, userId);

		const logConfig = getLogConfiguration(type, howToSet, userId);
		
		const embed = createStandardEmbed(
			logConfig.title,
			logConfig.description,
			logConfig.color,
			{
				thumbnail: member.displayAvatarURL(),
				timestamp: true
			}
		);

		await client.channels.cache.get(memberLogChannelID).send({ embeds: [embed] });
	} catch (err) {
		ErrorHandler.logError(err, "sendJoinProcessLog");
	}
}

/**
 * Gets configuration for different log types
 * @param {string} type - Type of registration event
 * @param {string} howToSet - What was set
 * @param {string} userId - User ID
 * @returns {Object} Configuration object with title, description, and color
 */
function getLogConfiguration(type, howToSet, userId) {
	const configs = {
		universityRegisterFinished: {
			title: EMBED_TITLES.UNIVERSITY_SELECTION_COMPLETED,
			description: `<@${userId}> さんの大学名を「${howToSet}」に設定しました。`,
			color: EMBED_COLORS.UNIVERSITY_REGISTER
		},
		organizationRegisterFinished: {
			title: EMBED_TITLES.ORGANIZATION_REGISTRATION_COMPLETED,
			description: `<@${userId}> さんの組織名を「${howToSet}」に設定しました。`,
			color: EMBED_COLORS.ORGANIZATION_REGISTER
		},
		joinRegisterFinished: {
			title: EMBED_TITLES.JOIN_REGISTRATION_COMPLETED,
			description: `<@${userId}> さんが参加登録を完了させました。登録された名前は「${howToSet}」です。`,
			color: EMBED_COLORS.JOIN_REGISTER
		}
	};

	return configs[type] || {
		title: "Unknown Event",
		description: `Event: ${type}, User: <@${userId}>, Value: ${howToSet}`,
		color: EMBED_COLORS.INFO
	};
}

/**
 * Finds or creates a role in the guild
 * @param {Object} guild - Discord guild
 * @param {string} roleName - Name of the role to find or create
 * @returns {Object} The role object
 */
async function findOrCreateRole(guild, roleName) {
	let role = guild.roles.cache.find(r => r.name === roleName);
	
	if (!role) {
		role = await guild.roles.create({
			name: roleName,
			permissions: [],
		});
	}
	
	return role;
}

/**
 * Builds self-introduction description based on user type
 * @param {Object} fields - Form fields from modal submission
 * @param {string} modalId - Modal ID to determine user type
 * @returns {string} Formatted description
 */
function buildSelfIntroductionDescription(fields, modalId) {
	if (modalId === "userSelfIntroductionModal") {
		// Organization user
		const organizationName = fields.getTextInputValue("organizationName");
		const organizationRole = fields.getTextInputValue("organizationRole");
		const organizationDescription = fields.getTextInputValue("organizationDescription");
		const userShortMessage = fields.getTextInputValue("userShortMessage");

		let description = `- 所属組織名：\n\`\`\`\n${organizationName}\n\`\`\`\n`;
		if (organizationRole) {
			description += `- 役職や部署：\n\`\`\`\n${organizationRole}\n\`\`\`\n`;
		}
		description += `- 所属組織について：\n\`\`\`\n${organizationDescription}\n\`\`\`\n- 一言：\n\`\`\`\n${userShortMessage}\n\`\`\`\n`;
		
		return description;
	} else {
		// University user
		const userGrade = fields.getTextInputValue("userGrade");
		const userClub = fields.getTextInputValue("userClub");
		const userShortMessage = fields.getTextInputValue("userShortMessage");
		
		// Extract university ID from modal ID
		const universityID = modalId.split("-")[1];
		const { getDatabaseFromSchoolID } = require("../database/databaseController");
		const universityInfo = getDatabaseFromSchoolID(universityID);
		const universityName = universityInfo[0].schoolName;

		let description = `- 所属大学：\n\`\`\`\n${universityName}\n\`\`\`\n- 学年/役職：\n\`\`\`\n${userGrade}\n\`\`\`\n`;
		if (userClub) {
			description += `- 所属サークル：\n\`\`\`\n${userClub}\n\`\`\`\n`;
		}
		description += `- 一言：\n\`\`\`\n${userShortMessage}\n\`\`\`\n`;
		
		return description;
	}
}

/**
 * Posts self-introduction to the designated channel
 * @param {Object} client - Discord client
 * @param {string} userName - User's name
 * @param {string} description - Self-introduction description
 * @param {string} userId - User ID
 * @param {string} avatarURL - User's avatar URL
 */
async function postSelfIntroduction(client, userName, description, userId, avatarURL) {
	const embed = new EmbedBuilder()
		.setTitle(`${userName}さんの自己紹介`)
		.setDescription(description)
		.setColor(generateRandomColor())
		.setThumbnail(avatarURL)
		.setTimestamp();

	await client.channels.cache
		.get(process.env.selfIntroductionChannelID)
		.send({
			content: `<@${userId}>`,
			embeds: [embed],
		});
}

module.exports = {
	sendJoinProcessLog,
	getLogConfiguration,
	findOrCreateRole,
	buildSelfIntroductionDescription,
	postSelfIntroduction,
};