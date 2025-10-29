const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	LabelBuilder,
} = require('discord.js');

/**
 * Creates a university name input modal
 * @param {string} customId - Custom ID for the modal
 * @returns {ModalBuilder} Configured modal builder
 */
function createUniversityNameModal(customId) {
	const modal = new ModalBuilder()
		.setCustomId(customId)
		.setTitle('所属大学の登録');

	const universityNameInput = new LabelBuilder()
		.setLabel('大学名')
		.setDescription(
			'あなたが所属する大学の正式名称またはその一部を入力してください。'
		)
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('universityNameInput')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('例) 架空野大学')
				.setRequired(true)
		);

	modal.addLabelComponents(universityNameInput);

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
		.setTitle('所属組織の登録');

	const organizationNameInput = new LabelBuilder()
		.setLabel('組織名')
		.setDescription('あなたが所属する組織の正式名称を正確に入力してください。')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('organizationNameInput')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('例) 架空野株式会社')
				.setRequired(true)
		);
	modal.addLabelComponents(organizationNameInput);

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
		.setTitle('自己紹介の登録');

	const nameInput = new LabelBuilder()
		.setLabel('本名(フルネーム)')
		.setDescription('本名(フルネーム)を空白無しで、入力してください。')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userName')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('架空野太郎')
				.setRequired(true)
		);

	const gradeInput = new LabelBuilder()
		.setLabel('現在の学年')
		.setDescription('現在の学年を入力してください。')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userGrade')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('大学1年/専門学校1年/広報部など')
				.setRequired(true)
		);
	const clubInput = new LabelBuilder()
		.setLabel('所属サークル(任意)')
		.setDescription(
			'何か学校のサークルなどに所属してる場合はその名前を入力してください。'
		)
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userClub')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('野球部/マンガ研究会など')
				.setRequired(false)
		);

	const shortMessageInput = new LabelBuilder()
		.setLabel('一言メッセージ')
		.setDescription('以上の内容で書ききれなかった事や、ご挨拶などをどうぞ')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userShortMessage')
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder('例) よろしくお願いします！')
				.setRequired(true)
		);

	modal.addLabelComponents(nameInput, gradeInput, clubInput, shortMessageInput);

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
		.setTitle('自己紹介の登録');

	const nameInput = new LabelBuilder()
		.setLabel('本名(フルネーム)')
		.setDescription('本名(フルネーム)を空白無しで、入力してください。')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userName')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('架空野太郎')
				.setRequired(true)
		);

	const organizationNameInput = new LabelBuilder()
		.setLabel('組織名')
		.setDescription(
			'絶対に変更しないでください！変更してしまった場合は灰色の文字をそのまま入力してください！'
		)
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('organizationName')
				.setStyle(TextInputStyle.Short)
				.setValue(organizationName)
				.setPlaceholder(organizationName)
				.setRequired(true)
		);

	const organizationRoleInput = new LabelBuilder()
		.setLabel('役職や部署など(任意)')
		.setDescription(
			`「${organizationName}」での役職や部署などを入力してください。`
		)
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('organizationRole')
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('例) 営業部/広報部など')
				.setRequired(false)
		);

	const organizationDescriptionInput = new LabelBuilder()
		.setLabel(`「${organizationName}」について`)
		.setDescription('業務分野や活動内容などを簡単に説明してください。')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('organizationDescription')
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder('例) IT企業で、主にWebサービスの開発を行っています。')
				.setRequired(true)
		);

	const shortMessageInput = new LabelBuilder()
		.setLabel('一言メッセージ')
		.setDescription('以上の内容で書ききれなかった事や、ご挨拶などをどうぞ')
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId('userShortMessage')
				.setStyle(TextInputStyle.Paragraph)
				.setPlaceholder('例) よろしくお願いします！')
				.setRequired(true)
		);

	modal.addLabelComponents(
		nameInput,
		organizationNameInput,
		organizationRoleInput,
		organizationDescriptionInput,
		shortMessageInput
	);

	return modal;
}

module.exports = {
	createUniversityNameModal,
	createOrganizationNameModal,
	createUniversitySelfIntroductionModal,
	createOrganizationSelfIntroductionModal,
};
