const leaveFromUnknownServer = require("../lib/events/leaveFromUnknownServer");

module.exports = async (client, guild) => {
	await leaveFromUnknownServer(client, guild);
};
