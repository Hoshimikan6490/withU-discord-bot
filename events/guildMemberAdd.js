// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");
const joinedMemberGuide = require("../lib/joinedMemberGuide");

module.exports = async (client, member) => {
	try {
		let joinedMember = await client.users.fetch(member.id);

		// 埋め込みの生成
		let [guildJoinContinue, embed1, embed2, embed3] = await joinedMemberGuide();

		(await joinedMember).send({
			embeds: [embed1, embed2, embed3],
			components: [guildJoinContinue],
		});
	} catch (err) {
		Sentry.captureException(err);
	}
};
