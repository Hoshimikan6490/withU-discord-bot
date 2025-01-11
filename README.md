# withU project management discord BOT
本コードは、withUプロジェクトのdiscordサーバーのマネジメントを支援するBOTとして作成されました。

# TODO
- [x] 入室ガイドの仕組み
- [ ] スレッドへの自動参加の仕組み
- [x] アナウンスチャンネルのAutoPublishの仕組み
- [x] Sentry を使う

# Server jon flow
1. サーバーに参加する
2. DMに案内を送る
3. DMの案内からボタンを押して、アンケート入力に進む
4. 新たなメッセージが送信され、大学名か組織名を入力する画面が出てくる。  
なお、組織名選択と大学名選択は、別の種類のボタン/モーダルを使用する。
5. 組織名登録の完了の旨と、名前登録開始ボタンが付いたメッセージを送信
6. モーダルで名前入力
7. 全部完了したら、完了したことを通知するメッセージを送信

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
# 使うDiscordサーバーのID
activeGuildID="0123456789"
# コンソール用のテキストチャットのチャンネルID
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

# school name database
学校名は、https://edu-data.jp/ の情報を使用している。 