const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');
require('dotenv').config({ quiet: true });

const SENTRY_DSN = process.env.sentryDSN;

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [nodeProfilingIntegration()],
		tracesSampleRate: 1.0,
		profilesSampleRate: 1.0,
	});
} else {
	console.warn('SENTRY_DSN が未設定のため、Sentryの初期化をスキップします');
}
