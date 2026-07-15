FROM node:24-bookworm-slim

# 作業ディレクトリを設定
WORKDIR /home/discord-bot

# ベースの環境整備
ENV NODE_ENV=production

# パッケージのインストールに必要なファイルだけコンテナにコピー
COPY ./package*.json ./

# 依存関係をインストール
RUN npm ci --omit=dev

# アプリケーションのソースをバンドルする
COPY . .

# ボットを起動するコマンド
CMD [ "npm", "run", "main" ]