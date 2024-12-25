// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  name: "test2",
  description: "test2",
  run: async (client, interaction) => {
    try {
      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("testSelectMenu")
          .setPlaceholder("選べ")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("せんたくし１")
              .setValue("option1")
          )
      );
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`button`)
          .setLabel("push me")
          .setStyle(ButtonStyle.Primary)
      );
      await interaction.reply({
        content: "Thanks for making a selection. Now, please push the button.",
        components: [selectMenu, button],
      });

      const collectedButton = await interaction.channel?.awaitMessageComponent({
        componentType: ComponentType.Button,
      });
      console.log(collectedButton.customId);

      // edit button
      selectMenu.components[0].setDisabled(true);
      button.components[0].setDisabled(true);

      return collectedButton.update({
        content: "Thanks for pushing the button.",
        components: [selectMenu, button],
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  },
};
