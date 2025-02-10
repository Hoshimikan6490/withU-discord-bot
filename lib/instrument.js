const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");
require("dotenv").config();

Sentry.init({
  dsn: process.env.sentryDSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});
