const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = async (client, member) => {
  let joinedMember = await client.users.fetch(member.id);
  // 参加したメンバーのDMにメッセージを送るように変更する事。
  // 処罰後の連絡先を決める！
  let guildJoinContinue = new ActionRowBuilder(
    new ButtonBuilder()
      .setCustomId("guildJoinContinue")
      .setEmoji("✅")
      .setLabel("続ける")
      .setStyle(ButtonStyle.Success)
  );
  let embed1 = new EmbedBuilder()
    .setTitle("withU サーバーにご参加いただき、ありがとうございます！")
    .setDescription(
      "本サーバーは、大学生同士の交流から様々なものづくりをしていくことを目標として、東京国際工科専門職大学(IPUT)を中心に複数の大学の学生が集まっているサーバーです。"
    );
  let embed2 = new EmbedBuilder()
    .setTitle("ご参加にあたり注意事項とアンケートのお願い")
    .setDescription(
      `本サーバーでは、安心・安全な環境づくりを目的としてルールを策定しております。これ以降の参加手続きを続ける場合は、以下のルールに同意したものとみなします。
      \`\`\`
1. ハラスメントや差別などは一切禁止。
2. スパム行為の禁止。
3. 露骨な年齢制限コンテンツ(暴力や性的なもの)は、原則投稿・画面共有等の他人が見える場所に公開する行為はご遠慮ください。話の流れなど、一般的に考慮できる範囲であれば限定的に投稿等の行為を許可しますが、必ずスポイラーの設定を設定し、そのような内容が含まれることをスポイラーの外に併記してください。
4. 露骨な宣伝行為は、宣伝行為を許可する旨がチャンネル名やチャンネル概要に書かれているチャンネルでのみ、許可されます。話の流れで「こんなのあるよ～」のように宣伝する行為は認められますが、全てのチャンネルにおいてチャンネルの趣旨に合わない場合や明らかに高頻度な宣伝行為は処罰の対象になります。
5. 以上のルールに反した行為を発見した場合、それ相応の処罰(警告やミュート(一定時間の発言禁止処分)、追放やBAN(永久追放))を行う場合があります。処罰に対し、異論がある場合は「」からお問い合わせが可能ですが、
\`\`\``
    );

  (await joinedMember).send({
    embeds: [embed1, embed2],
    compornents: [guildJoinContinue],
  });
};
