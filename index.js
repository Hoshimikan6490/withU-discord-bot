// for using sentry
require("./lib/monitoring/instrument");

const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const ErrorHandler = require("./lib/monitoring/errorHandler");
require("dotenv").config({ quiet: true });

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
});

const app = express();

//機密情報取得
const token = process.env.bot_token;
const PORT = process.env.PORT ? process.env.PORT : 8000;

//サイト立ち上げ
app.get("/", function (req, res) {
	res.sendStatus(200);
});
app.listen(PORT, () => {
	console.log(`Running on http://localhost:${PORT}`);
});

client.commands = [];
fs.readdir("./commands", (err, files) => {
	if (err) ErrorHandler.logError(err, "reading commands directory");
	files.forEach(async (f) => {
		try {
			if (f.endsWith(".js")) {
				let props = require(`./commands/${f}`);
				let propsJson = props.command.toJSON();
				client.commands.push(propsJson);
				console.log(`コマンドの読み込みが完了: ${propsJson.name}`);
			}
		} catch (err) {
			ErrorHandler.logError(err, `loading command ${f}`);
		}
	});
});

//events読み込み
fs.readdir("./events", (_err, files) => {
	files.forEach((file) => {
		if (!file.endsWith(".js")) return;
		const event = require(`./events/${file}`);
		let eventName = file.split(".")[0];
		console.log(`クライアントイベントの読み込みが完了: ${eventName}`);
		client.on(eventName, event.bind(null, client));
		delete require.cache[require.resolve(`./events/${file}`)];
	});
});

//Discordへの接続
client.login(token);
