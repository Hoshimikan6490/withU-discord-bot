// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");

const {
  REST,
  Routes,
  ActivityType,
  ThreadAutoArchiveDuration,
} = require("discord.js");
require("dotenv").config();
const os = require("node:os");
const leaveFromUnknownServer = require("../lib/leaveFromUnknownServer");

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
      Sentry.captureException(err);
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
  }, 10000);

  client.channels.cache
    .get(startupNotificationChannelID)
    .send(
      `${
        os.type().includes("Windows") ? "開発環境" : "本番環境"
      }で起動しました！`
    );

  // スレッドのKeepAlive
  async function threadKeepAlive() {
    try {
      const guild = await client.guilds.cache.get(process.env.activeGuildID);
      const activeThreads = await guild.channels.fetchActiveThreads();
      const now = Date.now();

      for (const thread of activeThreads.threads.values()) {
        const archiveTimestamp =
          thread.archiveTimestamp || thread.createdTimestamp;
        const autoArchiveDuration = thread.autoArchiveDuration * 60 * 1000;
        const archiveTime = archiveTimestamp + autoArchiveDuration;
        const timeUntilArchive = archiveTime - now;

        if (timeUntilArchive <= 6 * 60 * 60 * 1000) {
          // 6時間以内にアーカイブ予定
          const newDuration =
            thread.autoArchiveDuration === ThreadAutoArchiveDuration.OneWeek
              ? ThreadAutoArchiveDuration.ThreeDays
              : ThreadAutoArchiveDuration.OneWeek;

          if (thread.autoArchiveDuration !== newDuration) {
            await thread.setAutoArchiveDuration(newDuration);
            console.log(`スレッドの自動アーカイブ期間を更新: ${thread.name}`);
          }
        }
      }
    } catch (error) {
      console.error(
        "スレッドのアーカイブ時間を更新する際にエラーが発生しました:",
        error
      );
    }
  }
  // 6時間ごとに実行
  setInterval(threadKeepAlive, 6 * 60 * 60 * 1000);
  // とりあえず、1回実行
  threadKeepAlive();

  // 許可されていないサーバーから退出する
  client.guilds.cache.forEach(
    async (guild) => await leaveFromUnknownServer(client, guild)
  );
};
