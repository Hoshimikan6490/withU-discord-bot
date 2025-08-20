const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require("discord.js");

/**
 * Creates a university name input modal
 * @param {string} customId - Custom ID for the modal
 * @returns {ModalBuilder} Configured modal builder
 */
function createUniversityNameModal(customId) {
	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle("あなたが所属する大学名を入力してください。");

	const textInput = new TextInputBuilder()
		.setCustomId("universityNameInput")
		.setLabel("正式名称またはその一部を入力してください。")
		.setPlaceholder("例) 架空野大学")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const actionRow = new ActionRowBuilder().addComponents(textInput);
	modal.addComponents(actionRow);

	return modal;
}

/**
 * Creates an organization name input modal
 * @param {string} customId - Custom ID for the modal
 * @returns {ModalBuilder} Configured modal builder
 */
function createOrganizationNameModal(customId) {
	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle("あなたが所属する組織名を入力してください。");

	const textInput = new TextInputBuilder()
		.setCustomId("organizationNameInput")
		.setLabel("所属している組織の正式名称を入力してください。")
		.setPlaceholder("例) 架空野株式会社")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const actionRow = new ActionRowBuilder().addComponents(textInput);
	modal.addComponents(actionRow);

	return modal;
}

/**
 * Creates a self-introduction modal for university students
 * @param {string} customId - Custom ID for the modal
 * @returns {ModalBuilder} Configured modal builder
 */
function createUniversitySelfIntroductionModal(customId) {
	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle("自己紹介をご入力ください。");

	const nameInput = new TextInputBuilder()
		.setCustomId("userName")
		.setLabel("本名(フルネーム)を空白無しで、入力してください。")
		.setPlaceholder("架空野太郎")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const gradeInput = new TextInputBuilder()
		.setCustomId("userGrade")
		.setLabel("現在の学年を入力してください。")
		.setPlaceholder("大学1年/専門学校1年/広報部など")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const clubInput = new TextInputBuilder()
		.setCustomId("userClub")
		.setLabel(
			"何か学校のサークルなどに所属してる場合はその名前を入力してください。"
		)
		.setPlaceholder("野球部/マンガ研究会など")
		.setStyle(TextInputStyle.Short)
		.setRequired(false);

	const shortMessageInput = new TextInputBuilder()
		.setCustomId("userShortMessage")
		.setLabel("何か一言どうぞ！")
		.setPlaceholder("以上の内容で書ききれなかった事や、ご挨拶などをどうぞ")
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true);

	const actionRow1 = new ActionRowBuilder().addComponents(nameInput);
	const actionRow2 = new ActionRowBuilder().addComponents(gradeInput);
	const actionRow3 = new ActionRowBuilder().addComponents(clubInput);
	const actionRow4 = new ActionRowBuilder().addComponents(shortMessageInput);

	modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

	return modal;
}

/**
 * Creates a self-introduction modal for organization members
 * @param {string} customId - Custom ID for the modal
 * @param {string} organizationName - Name of the organization
 * @returns {ModalBuilder} Configured modal builder
 */
function createOrganizationSelfIntroductionModal(customId, organizationName) {
	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle("自己紹介をご入力ください。");

	const nameInput = new TextInputBuilder()
		.setCustomId("userName")
		.setLabel("本名(フルネーム)を空白無しで、入力してください。")
		.setPlaceholder("架空野太郎")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const organizationNameInput = new TextInputBuilder()
		.setCustomId("organizationName")
		.setLabel(
			"絶対に変更しないでください！変更してしまった場合は灰色の文字をそのまま入力してください！"
		)
		.setValue(organizationName)
		.setPlaceholder(organizationName)
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const organizationRoleInput = new TextInputBuilder()
		.setCustomId("organizationRole")
		.setLabel(
			`「${organizationName}」での役職や部署などを入力してください。(任意)`
		)
		.setStyle(TextInputStyle.Short)
		.setRequired(false);

	const organizationDescriptionInput = new TextInputBuilder()
		.setCustomId("organizationDescription")
		.setLabel(`「${organizationName}」について、簡単に説明してください。`)
		.setPlaceholder("業務分野や活動内容など")
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true);

	const shortMessageInput = new TextInputBuilder()
		.setCustomId("userShortMessage")
		.setLabel("何か一言どうぞ！")
		.setPlaceholder("以上の内容で書ききれなかった事や、ご挨拶などをどうぞ")
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true);

	const actionRow1 = new ActionRowBuilder().addComponents(nameInput);
	const actionRow2 = new ActionRowBuilder().addComponents(
		organizationNameInput
	);
	const actionRow3 = new ActionRowBuilder().addComponents(
		organizationRoleInput
	);
	const actionRow4 = new ActionRowBuilder().addComponents(
		organizationDescriptionInput
	);
	const actionRow5 = new ActionRowBuilder().addComponents(shortMessageInput);

	modal.addComponents(
		actionRow1,
		actionRow2,
		actionRow3,
		actionRow4,
		actionRow5
	);

	return modal;
}

module.exports = {
	createUniversityNameModal,
	createOrganizationNameModal,
	createUniversitySelfIntroductionModal,
	createOrganizationSelfIntroductionModal,
};
