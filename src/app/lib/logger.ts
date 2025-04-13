import chalk from 'chalk';

// Determine if debug logging should be enabled
// Use NODE_ENV for server-side checks, and allow overriding with NEXT_PUBLIC_DEBUG
const isDebugEnabled = 
  process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_DEBUG === 'true';

// Helper to format messages with timestamps and optional context
const formatMessage = (level: string, context: string | undefined, ...args: unknown[]): unknown[] => {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${timestamp}] [${level}] [${context}]` : `[${timestamp}] [${level}]`;
  
  // Apply colors using chalk based on level
  let coloredPrefix: string;
  switch(level) {
    case 'DEBUG': coloredPrefix = chalk.gray(prefix); break;
    case 'INFO': coloredPrefix = chalk.blue(prefix); break;
    case 'WARN': coloredPrefix = chalk.yellow(prefix); break;
    case 'ERROR': coloredPrefix = chalk.red(prefix); break;
    default: coloredPrefix = prefix;
  }
  
  return [coloredPrefix, ...args];
};

/**
 * Logger service for consistent application logging.
 */
const logger = {
  /**
   * Logs informational messages. Output to console.
   * Use for general application flow information.
   */
  info: (context?: string, ...args: unknown[]) => {
    console.info(...formatMessage('INFO', context, ...args));
  },

  /**
   * Logs warning messages. Output to console.
   * Use for potential issues that don't necessarily break functionality.
   */
  warn: (context?: string, ...args: unknown[]) => {
    console.warn(...formatMessage('WARN', context, ...args));
  },

  /**
   * Logs error messages. Output to console.
   * Use for errors, exceptions, and critical failures.
   */
  error: (context?: string, ...args: unknown[]) => {
    console.error(...formatMessage('ERROR', context, ...args));
  },

  /**
   * Logs debug messages. Only outputs if debug mode is enabled 
   * (NODE_ENV === 'development' or NEXT_PUBLIC_DEBUG === 'true').
   * Use for detailed diagnostic information useful during development.
   */
  debug: (context?: string, ...args: unknown[]) => {
    if (isDebugEnabled) {
      console.debug(...formatMessage('DEBUG', context, ...args));
    }
  },
};

export default logger; 