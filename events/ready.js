// for using sentry
require("../lib/monitoring/instrument");
const { REST, Routes, ActivityType } = require("discord.js");
const os = require("node:os");
const threadKeepAlive = require("../lib/events/threadKeepAlive");
const leaveFromUnknownServer = require("../lib/events/leaveFromUnknownServer");
const ErrorHandler = require("../lib/monitoring/errorHandler");
const { TIME_CONSTANTS } = require("../lib/config/constants");
require("dotenv").config({ quiet: true });

const token = process.env.bot_token;
const startupNotificationChannelID = process.env.startupNotificationChannelID;

module.exports = async (client) => {
	const rest = new REST({ version: "10" }).setToken(token);
	(async () => {
		try {
			await rest.put(Routes.applicationCommands(client.user.id), {
				body: await client.commands,
			});
			console.log("スラッシュコマンドの再読み込みに成功しました。");
		} catch (err) {
			ErrorHandler.logError(err, "slash command reload");
			console.log(
				`❌ スラッシュコマンドの再読み込み時にエラーが発生しました。：\n${err}`
			);
		}
	})();

	console.log(`${client.user.username}への接続に成功しました。`);

	setInterval(() => {
		client.user.setActivity(
			`Ping値は、${client.ws.ping}ms｜${
				os.type().includes("Windows") ? "開発環境" : "本番環境"
			}で起動中です`,
			{ type: ActivityType.Listening }
		);
	}, TIME_CONSTANTS.ACTIVITY_UPDATE_INTERVAL);

	client.channels.cache
		.get(startupNotificationChannelID)
		.send(
			`${
				os.type().includes("Windows") ? "開発環境" : "本番環境"
			}で起動しました！`
		);

	// スレッドのKeepAlive
	setInterval(() => threadKeepAlive(client), TIME_CONSTANTS.THREAD_KEEPALIVE_INTERVAL); // 6時間ごとの実行
	threadKeepAlive(client); //起動時の実行

	// 許可されていないサーバーから退出する
	client.guilds.cache.forEach(
		async (guild) => await leaveFromUnknownServer(client, guild)
	);
};
