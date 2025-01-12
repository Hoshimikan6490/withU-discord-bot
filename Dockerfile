FROM ubuntu:24.04

# 作業ディレクトリを設定
WORKDIR /home/discord-bot

# ベースの環境整備
RUN apt-get update
RUN apt-get install -y curl sudo
RUN sudo curl -sL https://deb.nodesource.com/setup_18.x | sudo bash - && sudo apt-get install -y nodejs

# パッケージのインストールに必要なファイルだけコンテナにコピー
COPY ./package*.json ./

# 依存関係をインストール
RUN npm install --omit=dev

# アプリケーションのソースをバンドルする
COPY ./ .

# ボットを起動するコマンド
CMD [ "node", "index.js" ]