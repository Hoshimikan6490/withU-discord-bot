// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} = require("discord.js");
require("dotenv").config({ quiet: true });

module.exports = {
  command: new SlashCommandBuilder()
    .setName("debug")
    .setDescription(
      "入室システムのテスト用のコマンドです。BOTの管理者以外は実行する事が出来ません。"
    ),

  run: async (client, interaction) => {
    // BOTの管理者以外は実行する事が出来ないようにする
    if (interaction.user.id !== process.env.botOwnerID) {
      return interaction.reply({
        content: "このコマンドはBOTの管理者のみ実行可能です。",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      let joinedMember = await client.users.fetch(interaction.user.id);
      // 処罰後の連絡先を決める！
      let guildJoinContinue = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("guildJoinContinue")
          .setEmoji("➡️")
          .setLabel("続ける")
          .setStyle(ButtonStyle.Primary)
      );
      let embed1 = new EmbedBuilder()
        .setTitle("withU サーバーにご参加いただき、ありがとうございます！")
        .setDescription(
          "本サーバーは、大学生同士の交流から様々なものづくりをしていくことを目標として、東京国際工科専門職大学(IPUT)を中心に複数の大学の学生が集まっているサーバーです。"
        );
      let embed2 = new EmbedBuilder()
        .setTitle("ご参加にあたり注意事項")
        .setDescription(
          `本サーバーでは、安心・安全な環境づくりを目的としてルールを策定しております。これ以降の参加手続きを続ける場合は、以下のルールに同意したものとみなします。
          まあ、一言でまとめてしまえば__「常識ある言動/行動をしろ」というだけ__ですが、言い争いになってからでは遅いので以下のように定めています。
          
          ## [ルールはこちらから確認！](https://docs.google.com/document/d/e/2PACX-1vQWDtLH0nCXh8oc1k-NMNeviG5QvvLVjlj0yApHKMCKvaHeBkmqCJxXXiALJ-OEa92z-s8VACL7R6x6/pub)
          `
        );
      let embed3 = new EmbedBuilder().setTitle("アンケートご協力のお願い")
        .setDescription(`本サーバーを安全に運用するため、全参加者様に所属団体(学校名や企業名)と本名をご回答いただき、その内容を参加後のサーバー内で参加者同士で閲覧できる状態にしております。なお、こちらの項目の回答は必須であり、回答した時点でサーバー内で参加者同士で互いに閲覧できる状態になることに同意したものとみなします。
      \nまた、基本的にすべてのユーザーに所属先の提示を義務付けていますが、本サーバー内での発言はアナウンスチャンネルなどのwithUとしての発信活動を除き、特に表記をしない場合はすべて個人の発言として扱われます。`);

      (await joinedMember).send({
        embeds: [embed1, embed2, embed3],
        components: [guildJoinContinue],
      });

      return interaction.reply({
        content: "DMに入室時の説明を送信しました。",
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  },
};
