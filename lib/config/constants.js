// Constants used throughout the Discord bot application

// Time constants (in milliseconds)
const TIME_CONSTANTS = {
	SIX_HOURS: 6 * 60 * 60 * 1000,
	ACTIVITY_UPDATE_INTERVAL: 10000,
	THREAD_KEEPALIVE_INTERVAL: 6 * 60 * 60 * 1000,
};

// Color constants for embeds
const EMBED_COLORS = {
	UNIVERSITY_REGISTER: 0x00ffff,
	ORGANIZATION_REGISTER: 0xffff00,
	JOIN_REGISTER: 0xff0000,
	ERROR: 0xff0000,
	WARNING: 0xffff00,
	SUCCESS: 0x00ff00,
	INFO: 0x0000ff,
};

// Error messages
const ERROR_MESSAGES = {
	GENERIC_ERROR: "❌ 何らかのエラーが発生しました。",
	ROLE_ADD_ERROR:
		"❌　ロール追加時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
	SELF_INTRODUCTION_ERROR:
		"❌　自己紹介の登録時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
	SERVER_ONLY:
		"❌ このBOTはサーバー内でのみ動作します。\nお手数をおかけしますが、サーバー内でご利用ください。",
	ADMIN_ONLY: "このコマンドはBOTの管理者のみ実行可能です。",
	UNIVERSITY_NOT_FOUND:
		"❌　大学名が見つかりませんでした。もう一度お試しください。",
};

// Success messages
const SUCCESS_MESSAGES = {
	DEBUG_DM_SENT: "DMに入室時の説明を送信しました。",
	REGISTRATION_COMPLETED: "入室手続きが完了！",
	ORGANIZATION_APPROVED: "✅ 参加を許可しました。",
	ORGANIZATION_REJECTED: "❌ 参加を拒否しました。",
};

// Labels and titles for various UI elements
const UI_LABELS = {
	CONTINUE_BUTTON: "続ける",
	UNIVERSITY_REGISTER_BUTTON: "大学生として登録する",
	ORGANIZATION_REGISTER_BUTTON: "大学生以外として登録する",
	CONFIRM_UNIVERSITY_BUTTON: "この大学で登録する",
	REJECT_UNIVERSITY_BUTTON: "この大学で登録しない",
	CONFIRM_ORGANIZATION_BUTTON: "この組織名で登録する",
	REJECT_ORGANIZATION_BUTTON: "この組織名で登録しない",
	APPROVE_BUTTON: "参加を許可する",
	REJECT_BUTTON: "参加を拒否する",
};

// Common embed titles
const EMBED_TITLES = {
	UNIVERSITY_SELECTION_COMPLETED: "大学選択を完了しました。（1/2）",
	ORGANIZATION_REGISTRATION_COMPLETED: "組織名登録が完了しました。（1/2）",
	JOIN_REGISTRATION_COMPLETED: "参加登録が完了しました。（2/2）",
	UNIVERSITY_APPROVED: "ご協力ありがとうございます！参加希望が許可されました！",
	ORGANIZATION_APPROVED: "ご協力ありがとうございます！",
	WAITING_FOR_ADMIN: "🔄️サーバー管理者の参加許可を待機中…",
	PARTICIPATION_REJECTED: "❌ 参加が拒否されました",
	REGISTRATION_COMPLETED: "入室手続きが完了！",
	IMPORTANT_NOTICE: "⚠️ 重要なお知らせ",
	ADMIN_CONFIRMATION: "新規参加者の登録確認",
};

// URLs
const URLS = {
	SUPPORT_FORM: "https://forms.gle/E5Pt7YRJfVcz4ZRJ6",
	RULES_DOCUMENT:
		"https://docs.google.com/document/d/e/2PACX-1vQWDtLH0nCXh8oc1k-NMNeviG5QvvLVjlj0yApHKMCKvaHeBkmqCJxXXiALJ-OEa92z-s8VACL7R6x6/pub",
};

// Emojis
const EMOJIS = {
	ARROW_RIGHT: "➡️",
	CHECK_MARK: "✅",
	STOP_SIGN: "⛔",
};

module.exports = {
	TIME_CONSTANTS,
	EMBED_COLORS,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	UI_LABELS,
	EMBED_TITLES,
	URLS,
	EMOJIS,
};
