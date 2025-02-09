const leaveFromUnknownServer = require("../leaveFromUnknownServer");

module.exports = async (client, guild) => {
  await leaveFromUnknownServer(client, guild);
};
