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
        .setLabel("※略称は使用しないでください")
        .setPlaceholder("例) 工学院大学")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      let actionRow = new ActionRowBuilder().addComponents(textInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    } else if (buttonId.includes(`universityNameCorrect`)) {
      // 大学登録処理
      let universityID = buttonId.split("-")[1];
      let universityInfo = getDatabaseFromSchoolID(universityID);

      // データベース更新
      await setUsedStatus(universityID, true);
      // 次の処理への誘導表示
      // TODO：　次ここ
    } else if (buttonId == "cancel" || buttonId == "delete") {
      // キャンセル処理
      await interaction.message.delete();
    }
  }

  if (interaction?.type == InteractionType.ModalSubmit) {
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
        .setStyle(ButtonStyle.Success)
    );

    let embed = new EmbedBuilder()
      .setTitle(`「${universityInfo[0].schoolName}」を登録しますか？`)
      .setFooter({
        text: "※正しい大学名が表示されない場合は、もう一度「この中にない」ボタンを押してキーワードを変更して再度お試しください。",
      });
    await interaction.reply({
      embeds: [embed],
      components: [universitySelectButton],
      ephemeral: true,
    });
  }
};
