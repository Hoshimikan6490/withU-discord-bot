const leaveFromUnknownServer = require("../lib/leaveFromUnknownServer");

module.exports = async (client, guild) => {
  await leaveFromUnknownServer(client, guild);
};
