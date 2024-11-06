# withU project management discord BOT
本コードは、withUプロジェクトのdiscordサーバーのマネジメントを支援するBOTとして作成されました。

# TODO
- [ ] 入室ガイドの仕組み
- [ ] スレッドへの自動参加の仕組み
- [ ] アナウンスチャンネルのAutoPublishの仕組み
- [x] Sentry を使う

# How to setup
1. run this command for clone this repo and install dependencies.
```
git clone https://github.com/Hoshimikan6490/withU-discord-bot.git
npm i
```
2. set environment info like this to '.env' file.
```
# Discord Bot Token
bot_token=YOUR_DISCORD_BOT_TOKEN_HERE
# 使うDiscordサーバーのIDをarrayで列挙
activeGuildIDs=["0123456789"]
# コンソール用のテキストチャットのチャンネルIDを記入
consoleChannelID=0123456789
# このアプリの起動に使うポートを指定。何も書かないと8000番が使われる。
PORT=8080
# SentryのDSN(TOKENのようなもの)
sentryDSN=https://public@sentry.example.com/1
```

# How to run
use this command.
```
npm run main
```