// src/logger.js
const LEVELS = ["debug", "info", "warn", "error"];
// pick your default via an env var, e.g. REACT_APP_LOG_LEVEL='debug'
const currentLevel = import.meta.env.VITE_APP_LOG_LEVEL || "info";
const currentIndex = LEVELS.indexOf(currentLevel);

type Logger = {
  [key in (typeof LEVELS)[number]]: (...args: any[]) => void;
};

const logger: Logger = LEVELS.reduce((acc, level, idx) => {
  acc[level] = (...args) => {
    if (idx >= currentIndex) {
      // you could add timestamps, JSON formatting, server‐side hooks, etc.
      console[level](`[${level.toUpperCase()}]`, ...args);
    }
  };
  return acc;
}, {} as Logger);

// convenience aliases
logger.error = logger.error;
logger.warn = logger.warn;
logger.info = logger.info;
logger.debug = logger.debug;

export default logger;
