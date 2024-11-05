const { InteractionType } = require("discord.js");
const fs = require("fs");

module.exports = async (client, interaction) => {
  if (!interaction?.guild) {
    return interaction?.reply({
      content:
        "❌ このBOTはサーバー内でのみ動作します。\nお手数をおかけしますが、サーバー内でご利用ください。",
      ephemeral: true,
    });
  } else {
    if (interaction?.type == InteractionType.ApplicationCommand) {
      fs.readdir("./commands", (err, files) => {
        if (err) throw err;
        files.forEach(async (f) => {
          let props = require(`../commands/${f}`);
          if (interaction.commandName == props.name) {
            try {
              return props.run(client, interaction);
            } catch (err) {
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
    }
  }
};
