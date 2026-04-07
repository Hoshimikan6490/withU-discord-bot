const Sentry = require('@sentry/node');
require('dotenv').config();

const SENTRY_DSN = process.env.sentryDSN;
const SENTRY_CRON_MONITOR_SLUG = process.env.SENTRY_CRON_MONITOR_SLUG;

if (!SENTRY_CRON_MONITOR_SLUG) {
	console.warn(
		'SENTRY_CRON_MONITOR_SLUG が未設定のため、Sentry check-inを送信しません',
	);
}

async function sendSentryCheckIn(reason) {
	if (!SENTRY_DSN || !SENTRY_CRON_MONITOR_SLUG) {
		return;
	}

	let checkInId;

	try {
		const sentryMonitorConfig = {
			schedule: {
				type: 'crontab',
				value: '*/5 * * * *',
			},
			timezone: 'Asia/Tokyo',
		};

		checkInId = Sentry.captureCheckIn({
			monitorSlug: SENTRY_CRON_MONITOR_SLUG,
			status: 'in_progress',
			monitorConfig: sentryMonitorConfig,
		});

		Sentry.captureCheckIn({
			checkInId,
			monitorSlug: SENTRY_CRON_MONITOR_SLUG,
			status: 'ok',
		});
	} catch (error) {
		console.error(`[Sentry] check-in失敗 (${reason}):`, error);

		if (checkInId) {
			try {
				Sentry.captureCheckIn({
					checkInId,
					monitorSlug: SENTRY_CRON_MONITOR_SLUG,
					status: 'error',
				});
			} catch (statusError) {
				console.error(
					`[Sentry] check-inステータス更新失敗 (${reason}):`,
					statusError,
				);
			}
		}
	}
}

module.exports = {
	sendSentryCheckIn,
};
