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
} = require("discord.js");
const fs = require("fs");

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
            .setLabel("[IPUT]国際工科専門職大学")
            .setValue("IPUT")
        );
      let universitySelectComponents = new ActionRowBuilder().addComponents(
        universitySelectMenu
      );
      let universitySelectButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("この中にはない")
          .setCustomId("universityNameNotListed")
          .setStyle(ButtonStyle.Secondary)
      );
      await interaction.reply({
        embeds: [embed],
        components: [universitySelectComponents, universitySelectButton],
      });
    } else if (buttonId == "cancel" || buttonId == "delete") {
      await interaction.message.delete();
    }
  }
};
