// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "test",
  description: "this is test.",
  run: async (client, interaction) => {
    try {
      let joinedMember = await client.users.fetch(interaction.user.id);
      // 処罰後の連絡先を決める！
      let guildJoinContinue = new ActionRowBuilder(
        new ButtonBuilder()
          .setCustomId("guildJoinContinue")
          .setEmoji("✅")
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
なお、このルールおよびそれ以降の参加案内で表示される「発言」という単語にはメッセージ送信やボイスチャットでの発言、画面共有など、すべての発信活動が含まれます。
      \`\`\`
1. 身分などを偽ったり、故意に虚偽の発言はしないでください。意図せず誤った情報の拡散などを本サーバー内で行った場合は、直ちにその旨と訂正内容を説明するようにしましょう。
2. ハラスメントや差別などの発言は一切禁止です。また、本サーバーは多様な人々が参加しているため、病気や特性などを持った方もいらっしゃいます。配慮に欠ける発言は控えるようにお願い致します。
3. スパム行為は一切禁止です。これには、高頻度に発言を繰り返す行為(宣伝も含みます)や明らかに話の流れやチャンネルの趣旨に合わない内容の発言も含まれます。
4. 露骨な年齢制限コンテンツ(暴力や性的なもの)は、原則投稿・画面共有等の他人が見える場所に公開する行為はご遠慮ください。話の流れなど、一般的に考慮できる範囲であれば限定的に投稿等の行為を許可しますが、必ずスポイラーの設定を設定し、そのような内容が含まれることをスポイラーの外に併記してください。
5. 露骨な宣伝行為は、宣伝行為を許可する旨がチャンネル名やチャンネル概要に書かれているチャンネルでのみ、許可されます。話の流れで「こんなのあるよ～」などのように宣伝する行為は認められますが、全てのチャンネルにおいてチャンネルの趣旨に合わない場合や明らかに高頻度な宣伝行為は処罰の対象になります。
6. 以上のルールに反した行為を発見した場合、それ相応の処罰(警告やミュート(一定時間の発言禁止処分)、追放やBAN(永久追放))を行う場合があります。処罰に対し、異論がある場合は「」からお問い合わせが可能ですが、十分に検討をした上で処罰を行うため、ご期待に応えられない可能性がございます。予めご了承ください。
\`\`\``
        );
      let embed3 = new EmbedBuilder().setTitle("アンケートご協力のお願い")
        .setDescription(`本サーバーを安全に運用するため、全参加者様に所属団体と本名をご回答いただき、その内容を参加後のサーバー内で参加者同士で閲覧できる状態にしております。
      \nまた、基本的にすべてのユーザーに所属先の提示を義務付けていますが、本サーバー内での発言はアナウンスチャンネルなどのwithUとしての発信活動を除き、特に表記をしない場合はすべて個人の発言として扱われます。`);

      console.log(guildJoinContinue);
      (await joinedMember).send({
        embeds: [embed1, embed2, embed3],
        components: [guildJoinContinue],
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  },
};