const levels: Record<string, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const defaultLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info');
let currentLevel = levels[defaultLevel] ?? levels.info;

export function setLogLevel(level: string) {
  if (levels[level] !== undefined) {
    currentLevel = levels[level];
  }
}

function formatArgs(args: any[]) {
  const ts = new Date().toISOString();
  return [ts, '-', ...args];
}

export const logger = {
  error: (...args: any[]) => {
    if (currentLevel >= levels.error) {
      // Use console.error to preserve stderr behavior
      console.error(...formatArgs(args));
    }
  },
  warn: (...args: any[]) => {
    if (currentLevel >= levels.warn) {
      console.warn(...formatArgs(args));
    }
  },
  info: (...args: any[]) => {
    if (currentLevel >= levels.info) {
      console.log(...formatArgs(args));
    }
  },
  debug: (...args: any[]) => {
    if (currentLevel >= levels.debug) {
      console.debug(...formatArgs(args));
    }
  },
};

export const { error, warn, info, debug } = logger;
export default logger;