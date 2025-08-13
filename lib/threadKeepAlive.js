// for using sentry
require("../lib/instrument");
const Sentry = require("@sentry/node");
const { ThreadAutoArchiveDuration } = require("discord.js");
require("dotenv").config({ quiet: true });

// スレッドのKeepAlive
async function threadKeepAlive(client) {
	try {
		const guild = await client.guilds.cache.get(process.env.activeGuildID);
		const activeThreads = await guild.channels.fetchActiveThreads();
		const now = Date.now();

		for (const thread of activeThreads.threads.values()) {
			const archiveTimestamp =
				thread.archiveTimestamp || thread.createdTimestamp;
			const autoArchiveDuration = thread.autoArchiveDuration * 60 * 1000;
			const archiveTime = archiveTimestamp + autoArchiveDuration;
			const timeUntilArchive = archiveTime - now;

			if (timeUntilArchive <= 6 * 60 * 60 * 1000) {
				// 6時間以内にアーカイブ予定
				const newDuration =
					thread.autoArchiveDuration === ThreadAutoArchiveDuration.OneWeek
						? ThreadAutoArchiveDuration.ThreeDays
						: ThreadAutoArchiveDuration.OneWeek;

				if (thread.autoArchiveDuration !== newDuration) {
					await thread.setAutoArchiveDuration(newDuration);
					console.log(`スレッドの自動アーカイブ期間を更新: ${thread.name}`);
				}
			}
		}
	} catch (err) {
		Sentry.captureException(err);
		console.log(
			"スレッドのアーカイブ時間を更新する際にエラーが発生しました:",
			err
		);
	}
}

module.exports = threadKeepAlive;
