// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");

const {
  InteractionType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const fs = require("fs");
const {
  getDatabaseFromSchoolID,
  getDatabaseFromSchoolName,
  setUsedStatus,
} = require("../databaseController");
require("dotenv").config();

async function sendJoinProcessLog(client, type, howToSet, userId) {
  let memberLogChannel = process.env.memberLogChannel;
  let embedTitle, embedDescription, embedColor;

  let guild = await client.guilds.cache.get(process.env.activeGuildID);
  let member = await guild.members.fetch(userId);

  if (type == "universityRegisterFinished") {
    embedTitle = `${member.user.globalName}さん(\`${userId}\`)が大学選択を完了しました！`;
  } else if (type == "userNameRegisterFinished") {
    embedTitle = `${member.user.globalName}さん(\`${userId}\`)が名前登録を完了しました！`;
  }

  if (type == "universityRegisterFinished") {
    embedDescription = `大学名に「${howToSet}」が設定されました。`;
  } else if (type == "userNameRegisterFinished") {
    embedDescription = `名前を「${howToSet}」に設定されました。`;
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
    .setColor(0xffff00)
    .setTimestamp();

  await client.channels.cache.get(memberLogChannel).send({ embeds: [embed] });
}

module.exports = async (client, interaction) => {
  if (interaction?.type == InteractionType.ApplicationCommand) {
    if (!interaction?.guild) {
      return interaction?.reply({
        content:
          "❌ このBOTはサーバー内でのみ動作します。\nお手数をおかけしますが、サーバー内でご利用ください。",
        ephemeral: true,
      });
    }

    fs.readdir("./commands", (err, files) => {
      if (err) throw err;
      files.forEach(async (f) => {
        let props = require(`../commands/${f}`);
        if (interaction.commandName == props.name) {
          try {
            return props.run(client, interaction);
          } catch (err) {
            Sentry.captureException(err);
            return interaction?.reply({
              content: `❌ 何らかのエラーが発生しました。`,
              ephemeral: true,
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
      // 大学選択メニューを表示
      let embed = new EmbedBuilder()
        .setTitle("所属大学/組織名登録")
        .setDescription(
          "まずは、あなたが所属している大学または組織の名前を1つだけ登録してください。\nなお、このリストの中にあなたの所属している大学名または組織名が無い場合は何も選ばずに「この中にない」ボタンを押してください。"
        );
      let universitySelectMenu = new StringSelectMenuBuilder()
        .setCustomId("universitySelectMenu")
        .setPlaceholder("大学名を選んでください")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("国際工科専門職大学")
            .setValue("F113310102993")
        );
      let universitySelectComponents = new ActionRowBuilder().addComponents(
        universitySelectMenu
      );
      let universityNameNotListed = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("この中にはない")
          .setCustomId("universityNameNotListed")
          .setStyle(ButtonStyle.Secondary)
      );
      await interaction.reply({
        embeds: [embed],
        components: [universitySelectComponents, universityNameNotListed],
      });
    } else if (buttonId == "universityNameNotListed") {
      // 大学名入力モーダルを表示
      let modal = new ModalBuilder()
        .setCustomId("askUniversityName")
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

      // 大学登録処理
      let universityID = buttonId.split("-")[1];
      let universityInfo = getDatabaseFromSchoolID(universityID);
      let universityName = universityInfo[0].schoolName;

      // データベース更新
      await setUsedStatus(universityID, true);

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

        // 既にロールを持っている場合は、次のガイドに従うように案内する
        if (!member.roles.cache.some((role) => role.name === universityName)) {
          member.roles.add(role);
        } else {
          return interaction.editReply({
            content:
              "⚠️　既に大学選択処理は完了しています。\n次の名前登録へお進みください。",
          });
        }
      } catch (err) {
        Sentry.captureException(err);
        return interaction.editReply({
          content:
            "❌　ロール追加時にエラーが発生しました。お手数ですが、以下のURLから管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
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
          "続いて、お名前の登録をお願い致します。これが完了しますと、入室手続きは完了となります。"
        )
        .setFooter({
          text: "なお、不正な情報を登録した場合、処罰の対象になる場合もあります。",
        });

      let nameRegisterContinue = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("nameRegisterContinue")
          .setLabel("続ける")
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Success)
      );

      await interaction.editReply({
        embeds: [embed],
        components: [nameRegisterContinue],
      });
    } else if (buttonId == "nameRegisterContinue") {
      // 名前登録のモーダル表示
      let modal = new ModalBuilder()
        .setCustomId("userNameModal")
        .setTitle("本名ををフルネームでご入力ください。");
      let textInput = new TextInputBuilder()
        .setCustomId("userName")
        .setLabel("必ず本名をフルネームでスペース無しで入力してください")
        .setPlaceholder("架空野太郎")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      let actionRow = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    } else if (buttonId == "cancel" || buttonId == "delete") {
      // キャンセル処理
      await interaction.message.delete();
    }
  }

  if (interaction?.type == InteractionType.ModalSubmit) {
    let modalId = interaction.customId;
    if (modalId == "askUniversityName") {
      let universityNameInput = interaction.fields.getTextInputValue(
        "universityNameInput"
      );

      let universityInfo = getDatabaseFromSchoolName(universityNameInput);
      if (universityInfo.length == 0) {
        // 大学名が見つからなかった場合
        return interaction.reply({
          content:
            "❌　大学名が見つかりませんでした。検索キーワードを変えてもう一度お試しください。",
          ephemeral: true,
        });
      }
      if (universityInfo[0].used == true) {
        // 既に登録済みの大学名が入力された場合
        return interaction.reply({
          content: `❌　「${universityInfo[0].schoolName}」はすでにプルダウンリストに登録されています。そちらからお選びください。`,
          ephemeral: true,
        });
      }

      let universitySelectButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("この大学で登録する")
          .setCustomId(`universityNameCorrect-${universityInfo[0].schoolID}`)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setLabel("この大学で登録しない")
          .setCustomId("universityNameNotListed")
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
    } else if (modalId == "userNameModal") {
      await interaction.deferReply();
      // お名前登録処理
      let userName = interaction.fields.getTextInputValue("userName");

      try {
        // ユーザー名の設定
        let guild = await client.guilds.cache.get(process.env.activeGuildID);
        let member = await guild.members.fetch(interaction.user.id);
        await member.setNickname(userName);
      } catch (err) {
        Sentry.captureException(err);
        return interaction.editReply({
          content:
            "❌　お名前の登録時にエラーが発生しました。お手数ですが、以下のURLから管理者までお問い合わせください。\nhttps://forms.gle/E5Pt7YRJfVcz4ZRJ6",
        });
      }

      // ログを残す
      await sendJoinProcessLog(
        client,
        "userNameRegisterFinished",
        userName,
        interaction.user.id
      );
    }
  }
};
