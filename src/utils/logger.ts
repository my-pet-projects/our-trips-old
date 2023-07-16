import pino from "pino";
import PinoPretty from "pino-pretty";

const prettyStream = PinoPretty({
  colorize: true,
});

const stream =
  process.env.NODE_ENV === "production" ? process.stdout : prettyStream;

const logger = pino(
  {
    level: "debug",
    base: {
      env: process.env.NODE_ENV,
      revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
    },
  },
  stream
);

export default logger;
