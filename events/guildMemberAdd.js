// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = async (client, member) => {
  try {
    let joinedMember = await client.users.fetch(member.id);
    // TODO: 処罰後の連絡先を決める！

    // 埋め込みの生成
    let [guildJoinContinue, embed1, embed2, embed3] = await joinedMemberGuide();

    (await joinedMember).send({
      embeds: [embed1, embed2, embed3],
      components: [guildJoinContinue],
    });
  } catch (err) {
    Sentry.captureException(err);
  }
};

module.exports.joinedMemberGuide = () => {
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

  return [guildJoinContinue, embed1, embed2, embed3];
};
