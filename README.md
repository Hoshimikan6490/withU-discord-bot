# withU project management discord BOT
本コードは、withUプロジェクトのdiscordサーバーのマネジメントを支援するBOTとして作成されました。

# TODO
- [x] 入室ガイドの仕組み
- [x] スレッドへの自動参加の仕組み
- [x] スレッドのkeep aliveの仕組み
- [x] アナウンスチャンネルのAutoPublishの仕組み
- [x] Sentry を使う

# Server jon flow
1. サーバーに参加する
2. DMに案内を送る
3. DMの案内からボタンを押して、アンケート入力に進む
4. 新たなメッセージが送信され、大学名か組織名を入力する画面が出てくる。  
なお、組織名選択と大学名選択は、別の種類のボタン/モーダルを使用する。
5. 組織名登録の完了の旨と、自己紹介登録開始ボタンが付いたメッセージを送信
6. モーダルで自己紹介を入力
7. 全部完了したら、完了したことを通知するメッセージを送信

# How to setup
1. run this command for clone this repo and install dependencies.
```
git clone https://github.com/Hoshimikan6490/withU-discord-bot.git
npm i
```
2. set environment info like this to '.env' file.
```
# Discord BOT Token
bot_token=YOUR_DISCORD_BOT_TOKEN_HERE
# 使うDiscordサーバーのID
activeGuildID=SERVER_ID_HERE
# BOTの管理者のDiscordユーザーID
botOwnerID=OWNER_ID_HERE
# memberロールのID
memberRoleID=MEMBER_ROLE_ID_HERE
# 入室手続きのログを表示するチャンネルID
memberLogChannelID=MEMBER_LOG_CHANNEL_ID_HERE
# 自己紹介チャンネルのチャンネルID
selfIntroductionChannelID=SELFINTRODUCTION_CHANNEL_ID_HERE
## 組織所属の新規参加者の承認要求が送信されるテキストチャンネルのチャンネルID
adminChannelID=ADMIN_CHANNEL_ID_HERE

# このアプリの起動に使うポートを指定。何も書かないと8000番が使われる。
PORT=8080

# SentryのDSN(TOKENのようなもの)
sentryDSN=YOUR_SENTRY_DSN_HERE
SENTRY_CRON_MONITOR_SLUG=YOUR_CRON_MONITOR_SLUG_HERE

# Discord BOTのサポートサーバー招待リンク
supportServer=SUPPORT_SERVER_INVITE_URL_HERE
```

# How to run
## for development
use this command.
```
npm run main
```
## for production
use this command.
```
sudo npm run prod:start
```
This starts the systemd service, and the service runs docker-compose.
if you stop it, use this command.
```
sudo npm run prod:stop
```
This stops the systemd service.

## for production on boot with systemd
1. run this command on the host after cloning and installing dependencies.
```bash
sudo npm run prod:install
```
2. if you want to remove the registration later, run this command.
```bash
sudo npm run prod:uninstall
```
3. after registration, use `sudo npm run prod:start` to start production and `sudo npm run prod:stop` to stop it.

# school name database
学校名は、https://edu-data.jp/ の情報を使用している。 