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
const { getDatabase } = require("../databaseController");

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
    } else if (buttonId == "cancel" || buttonId == "delete") {
      await interaction.message.delete();
    }
  }

  if (interaction?.type == InteractionType.ModalSubmit) {
    let universityNameInput = interaction.fields.getTextInputValue(
      "universityNameInput"
    );

    let universityInfo = getDatabase(universityNameInput);
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
        .setLabel("プルダウンリストに戻る")
        .setCustomId("cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [
        {
          title: `「${universityInfo[0].schoolName}」を登録しますか？`,
        },
      ],
      components: [universitySelectButton],
    });
  }
};
