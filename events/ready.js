// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");

const { ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
require("dotenv").config();

const token = process.env.bot_token;
const consoleChannelID = process.env.consoleChannelID;

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
      `Ping値は、${client.ws.ping}ms｜localhostで起動中です`,
      { type: ActivityType.Listening }
    );
  }, 10000);

  client.channels.cache.get(consoleChannelID).send("起動しました！");
};
