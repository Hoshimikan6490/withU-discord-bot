// for using sentry
require('../monitoring/instrument');
const { ThreadAutoArchiveDuration } = require('discord.js');
const ErrorHandler = require('../monitoring/errorHandler');
const { TIME_CONSTANTS } = require('../config/constants');
require('dotenv').config({ quiet: true });

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

			if (timeUntilArchive <= TIME_CONSTANTS.SIX_HOURS) {
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
		ErrorHandler.logError(err, 'threadKeepAlive');
		console.log(
			'スレッドのアーカイブ時間を更新する際にエラーが発生しました:',
			err
		);
	}
}

module.exports = threadKeepAlive;
