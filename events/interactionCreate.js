// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");

const {
  InteractionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  ApplicationCommandType,
} = require("discord.js");
const fs = require("fs");
const {
  getDatabaseFromSchoolID,
  getDatabaseFromSchoolName,
} = require("../databaseController");
const { joinedMemberGuide } = require("./guildMemberAdd");
require("dotenv").config();

async function sendJoinProcessLog(client, type, howToSet, userId) {
  let memberLogChannelID = process.env.memberLogChannelID;
  let embedTitle, embedDescription, embedColor;

  let guild = await client.guilds.cache.get(process.env.activeGuildID);
  let member = await guild.members.fetch(userId);

  if (type == "universityRegisterFinished") {
    embedTitle = "大学選択を完了しました。";
  } else if (type == "userNameRegisterFinished") {
    embedTitle = "名前登録が完了しました。";
  }

  if (type == "universityRegisterFinished") {
    embedDescription = `<@${userId}> さんの大学名を「${howToSet}」に設定しました。`;
  } else if (type == "userNameRegisterFinished") {
    embedDescription = `<@${userId}> さんのニックネームを「${howToSet}」に設定しました。`;
  }

  if (type == "universityRegisterFinished") {
    embedColor = 0xffff00;
  } else if (type == "userNameRegisterFinished") {
    embedColor = 0x00ff00;
  }

  let embed = new EmbedBuilder()
    .setTitle(embedTitle)
    .setDescription(embedDescription)
    .setThumbnail(member.displayAvatarURL())
    .setColor(embedColor)
    .setTimestamp();

  await client.channels.cache.get(memberLogChannelID).send({ embeds: [embed] });
}

async function universityRegister(client, interaction, customId) {
  // 大学登録処理
  let universityID = customId.split("-")[1];
  let universityInfo = getDatabaseFromSchoolID(universityID);
  let universityName = universityInfo[0].schoolName;

  // エラー処理のために、次の処理への案内用のボタンをここで定義
  let nameRegisterContinue = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`nameRegisterContinue_${universityID}`) //自己紹介送信のため、大学IDを引き継ぐ
      .setLabel("続ける")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Success)
  );

  // ロール追加
  try {
    let guild = await client.guilds.cache.get(process.env.activeGuildID);
    let role = await guild.roles.cache.find(
      (role) => role.name === universityName
    );
    if (!role) {
      // ロールが無い場合は、作成する
      role = await guild.roles.create({
        name: universityName,
        permissions: [],
      });
    }
    let member = await guild.members.fetch(interaction.user.id);

    // 登録画面を無効化
    let universitySelectButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("この大学で登録する")
        .setCustomId(`universityNameCorrect-${universityInfo[0].schoolID}`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
      new ButtonBuilder()
        .setLabel("この大学で登録しない")
        .setCustomId("reShowUniversityNameInputModal")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    let embed = new EmbedBuilder()
      .setTitle(`「${universityInfo[0].schoolName}」を登録しますか？`)
      .setFooter({
        text: "※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。",
      });

    const channel = await interaction.user.createDM();
    const message = await channel.messages.fetch(interaction.message.id);
    await message.edit({
      embeds: [embed],
      components: [universitySelectButton],
    });

    // 既にロールを持っている場合は、次のガイドに従うように案内する
    if (!member.roles.cache.some((role) => role.name === universityName)) {
      member.roles.add(role);
    } else {
      return interaction.editReply({
        content:
          "⚠️　既に大学選択処理は完了しています。\n次の名前登録へお進みください。",
        components: [nameRegisterContinue],
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    return interaction.editReply({
      content:
        "❌　ロール追加時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
    });
  }

  // ログを残す
  await sendJoinProcessLog(
    client,
    "universityRegisterFinished",
    universityName,
    interaction.user.id
  );

  // 次の処理への誘導表示
  let embed = new EmbedBuilder()
    .setTitle("ご協力ありがとうございます！")
    .setDescription(
      `あなたの所属大学名を__**${universityName}**__に設定しました！\n\n続いて、自己紹介の入力をお願い致します。これが完了しますと、入室手続きは完了となります。`
    )
    .setFooter({
      text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
    });

  await interaction.editReply({
    embeds: [embed],
    components: [nameRegisterContinue],
  });
}

module.exports = async (client, interaction) => {
  if (interaction?.type == InteractionType.ApplicationCommand) {
    if (!interaction?.guild) {
      return interaction?.reply({
        content:
          "❌ このBOTはサーバー内でのみ動作します。\nお手数をおかけしますが、サーバー内でご利用ください。",
        flags: MessageFlags.Ephemeral,
      });
    }

    fs.readdir("./commands", (err, files) => {
      if (err) throw err;
      files.forEach(async (f) => {
        let props = require(`../commands/${f}`);
        let propsJson = props.command.toJSON();

        // commandsフォルダ内のファイルで特にタイプの指定が無ければ、スラッシュコマンドとして指定する。
        if (propsJson.type == undefined) {
          propsJson.type = ApplicationCommandType.ChatInput;
        }

        if (
          interaction.commandName == propsJson.name &&
          interaction.commandType == propsJson.type
        ) {
          try {
            return props.run(client, interaction);
          } catch (err) {
            Sentry.captureException(err);
            return interaction?.reply({
              content: `❌ 何らかのエラーが発生しました。`,
              flags: MessageFlags.Ephemeral,
            });
          }
        }
      });
    });
  }

  if (interaction?.type == InteractionType.MessageComponent) {
    // button 処理
    let buttonId = interaction.customId;
    if (buttonId == "guildJoinContinue") {
      let embed = new EmbedBuilder().setTitle(
        "下のボタンから大学名/組織名を設定してください"
      );

      let showUniversityNameInputModalButton =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("showUniversityNameInputModal")
            .setLabel("大学名を登録する")
            .setStyle(ButtonStyle.Success)
          // TODO: 組織名も登録できるようにする
        );

      await interaction.reply({
        embeds: [embed],
        components: [showUniversityNameInputModalButton],
      });
      ////////////////////////////////////////////////
      // 最初の「続ける」ボタンを無効化
      let [guildJoinContinue, embed1, embed2, embed3] =
        await joinedMemberGuide();

      guildJoinContinue.components[0].setDisabled(true);

      const channel = await interaction.user.createDM();
      const message = await channel.messages.fetch(interaction.message.id);
      await message.edit({
        embeds: [embed1, embed2, embed3],
        components: [guildJoinContinue],
      });
    } else if (
      buttonId
        .toLocaleLowerCase()
        .includes("showUniversityNameInputModal".toLocaleLowerCase())
    ) {
      // 大学名入力モーダルを表示
      let retry;
      if (buttonId == "reShowUniversityNameInputModal") {
        retry = true;
      } else {
        retry = false;
      }

      let modal = new ModalBuilder()
        .setCustomId(retry ? "reAskUniversityName" : "askUniversityName")
        .setTitle("あなたが所属する大学名を入力してください。");
      let textInput = new TextInputBuilder()
        .setCustomId("universityNameInput")
        .setLabel("正式名称またはその一部を入力してください。")
        .setPlaceholder("例) 架空野大学")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      let actionRow = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    } else if (buttonId.includes(`universityNameCorrect`)) {
      await interaction.deferReply();
      let customId = interaction.customId;

      await universityRegister(client, interaction, customId);
    } else if (buttonId.includes("nameRegisterContinue")) {
      // 引き継ぐ大学IDを取得
      let universityID = buttonId.substring(21);

      // 名前登録のモーダル表示
      let modal = new ModalBuilder()
        .setCustomId(`userNameModal_${universityID}`)
        .setTitle("自己紹介をご入力ください。");
      let nameInput = new TextInputBuilder()
        .setCustomId("userName")
        .setLabel("本名(フルネーム)を空白無しで、入力してください。")
        .setPlaceholder("架空野太郎")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      let gradeInput = new TextInputBuilder()
        .setCustomId("userGrade")
        .setLabel("大学生は現在の学年を、それ以外は役職を入力してください。")
        .setPlaceholder("大学1年/専門学校1年/広報部など")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      let clubInput = new TextInputBuilder()
        .setCustomId("userClub")
        .setLabel(
          "何か学校のサークルなどに所属してる場合はその名前を入力してください。"
        )
        .setPlaceholder("野球部/マンガ研究会など")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      let shortMessageInput = new TextInputBuilder()
        .setCustomId("userShortMessage")
        .setLabel("何か一言どうぞ！")
        .setPlaceholder("以上の内容で書ききれなかった事や、ご挨拶などをどうぞ")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      let actionRow1 = new ActionRowBuilder().addComponents(nameInput);
      let actionRow2 = new ActionRowBuilder().addComponents(gradeInput);
      let actionRow3 = new ActionRowBuilder().addComponents(clubInput);
      let actionRow4 = new ActionRowBuilder().addComponents(shortMessageInput);
      modal.addComponents(actionRow1, actionRow2, actionRow3, actionRow4);

      await interaction.showModal(modal);
    } else if (buttonId == "cancel" || buttonId == "delete") {
      // キャンセル処理
      await interaction.message.delete();
    }
  }

  if (interaction?.type == InteractionType.ModalSubmit) {
    let modalId = interaction.customId;
    if (
      modalId.toLowerCase().includes("askUniversityName".toLocaleLowerCase())
    ) {
      let universityNameInput = interaction.fields.getTextInputValue(
        "universityNameInput"
      );

      let universityInfo = getDatabaseFromSchoolName(universityNameInput);

      if (universityInfo.length == 0) {
        await interaction.reply({
          content: "❌　大学名が見つかりませんでした。もう一度お試しください。",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        let universitySelectButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("この大学で登録する")
            .setCustomId(`universityNameCorrect-${universityInfo[0].schoolID}`)
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setLabel("この大学で登録しない")
            .setCustomId("reShowUniversityNameInputModal")
            .setStyle(ButtonStyle.Secondary)
        );

        let embed = new EmbedBuilder()
          .setTitle(`「${universityInfo[0].schoolName}」を登録しますか？`)
          .setFooter({
            text: "※正しい大学名が表示されない場合は、「この大学で登録しない」ボタンを押して再度キーワードを変更してお試しください。",
          });

        await interaction.reply({
          embeds: [embed],
          components: [universitySelectButton],
        });
        ////////////////////////////////////////////////
        // 大学名の質問モーダルの表示が２回目以降の場合は、前のメッセージを削除
        // 最初の場合は、「大学名を登録する」ボタンを無効化
        if (modalId == "reAskUniversityName") {
          await interaction.message.delete();
        } else {
          let editMessageEmbed = new EmbedBuilder().setTitle(
            "下のボタンから大学名/組織名を設定してください"
          );

          let showUniversityNameInputModalButton =
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("showUniversityNameInputModal")
                .setLabel("大学名を登録する")
                .setStyle(ButtonStyle.Success)
                .setDisabled(true)
              // TODO: 組織名も登録できるようにする
            );

          const channel = await interaction.user.createDM();
          const message = await channel.messages.fetch(interaction.message.id);
          await message.edit({
            embeds: [editMessageEmbed],
            components: [showUniversityNameInputModalButton],
          });
        }
      }
    } else if (modalId.includes("userNameModal")) {
      await interaction.deferReply();
      // 自己紹介モーダル送信後処理
      let userName = interaction.fields.getTextInputValue("userName");
      let userGrade = interaction.fields.getTextInputValue("userGrade");
      let userClub = interaction.fields.getTextInputValue("userClub");
      let userShortMessage =
        interaction.fields.getTextInputValue("userShortMessage");
      // 引き継がれた大学IDを取得
      let universityID = modalId.substring(14);

      try {
        // ユーザー名の設定
        let guild = await client.guilds.cache.get(process.env.activeGuildID);
        let member = await guild.members.fetch(interaction.user.id);
        await member.setNickname(userName);

        // 大学名を取得
        let universityInfo = getDatabaseFromSchoolID(universityID);
        let universityName = universityInfo[0].schoolName;

        // 自己紹介埋め込み色の設定
        var letters = "0123456789ABCDEF";
        var color = "0x";
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        // 自己紹介文の送信
        let embed = new EmbedBuilder()
          .setTitle(`${userName}さんの自己紹介`)
          .setDescription(
            `- 所属大学/組織名：\n\`\`\`\n${universityName}\n\`\`\`\n- 学年/役職：\n\`\`\`\n${userGrade}\n\`\`\`\n- 所属サークル：\n\`\`\`\n${userClub}\n\`\`\`\n- 一言：\n\`\`\`\n${userShortMessage}\n\`\`\`\n`
          )
          .setColor(Number(color))
          .setThumbnail(member.displayAvatarURL());
        client.channels.cache.get(process.env.selfIntroductionChannelID).send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
        });

        // メンバーロールを付与
        await member.roles.add(process.env.memberRoleID);

        // 自己紹介入力フォームを開くボタンをdisableにして、次の処理への誘導表示
        const channel = await interaction.user.createDM();
        const message = await channel.messages.fetch(interaction.message.id);
        const newComponent = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`nameRegisterContinue`)
            .setLabel("続ける")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        );
        await message.edit({
          embeds: message.embeds,
          components: [newComponent],
        });
        // TODO: ２つ目のフォームの内容が名前登録から自己紹介登録に変わったので、変数名修正

        // 完了した旨をDMに送信
        let finishedEmbed = new EmbedBuilder()
          .setTitle("入室手続きが完了！")
          .setDescription(
            "入室手続きが完了しました。サーバー内の各チャンネルの使い方は、チャンネルトピックを参考にしながらご利用ください。ご不明な点等がございましたら、雑談チャンネルや運営までお問い合わせください。"
          )
          .setColor(0xff0000)
          .setTimestamp();
        await interaction.editReply({
          embeds: [finishedEmbed],
        });

        // ログを残す
        return sendJoinProcessLog(
          client,
          "userNameRegisterFinished",
          userName,
          interaction.user.id
        );
      } catch (err) {
        Sentry.captureException(err);
        return interaction.editReply({
          content:
            "❌　お名前の登録時にエラーが発生しました。お手数ですが、以下のURLからDiscordのIDを添えて管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
        });
      }
    }
  }
};
