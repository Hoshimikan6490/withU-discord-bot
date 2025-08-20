// for using sentry
require("../lib/instrument");
const joinedMemberGuide = require("../lib/joinedMemberGuide");
const ErrorHandler = require("../lib/errorHandler");

module.exports = async (client, member) => {
	// BOTが参加した場合は何もしない
	if (member.user.bot) return;

	try {
		let joinedMember = await client.users.fetch(member.id);

		// 埋め込みの生成
		let [guildJoinContinue, embed1, embed2, embed3] = await joinedMemberGuide();

		(await joinedMember).send({
			embeds: [embed1, embed2, embed3],
			components: [guildJoinContinue],
		});
	} catch (err) {
		ErrorHandler.logError(err, "guildMemberAdd");
	}
};
