// for using sentry
require("../instrument");
const Sentry = require("@sentry/node");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "test2",
  description: "test2",
  run: async (client, interaction) => {
    try {
      const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder(`Select a match to tip on.`)
          .addOptions([{ label: `select me`, value: `testValue` }])
      );
      await interaction.reply({
        content: "Please make a selection",
        components: [select],
        ephemeral: true,
      });

      const collectedSelect = await interaction.channel?.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
      });
      console.log(collectedSelect.values[0]);

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`button`)
          .setLabel("push me")
          .setStyle(ButtonStyle.Primary)
      );
      await collectedSelect.update({
        content: "Thanks for making a selection. Now, please push the button.",
        components: [button],
        ephemeral: true,
      });

      const collectedButton = await interaction.channel?.awaitMessageComponent({
        componentType: ComponentType.Button,
      });
      console.log(collectedButton.customId);

      return collectedButton.update({
        content: "Thanks for pushing the button.",
        components: [],
        ephemeral: true,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  },
};
