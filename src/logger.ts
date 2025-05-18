import * as core from '@actions/core';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static instance: Logger;
  private debugMode = false;
  private startTime: number;
  
  /**
   * Check if debug logging is enabled
   */
  public isDebugEnabled(): boolean {
    return this.debugMode;
  }

  private constructor(debug = false) {
    this.debugMode = debug;
    this.startTime = Date.now();
  }

  public static getInstance(debug = false): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(debug);
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, emoji = ''): string {
    const timestamp = new Date().toISOString();
    const elapsed = `+${((Date.now() - this.startTime) / 1000).toFixed(2)}s`;
    const prefix = emoji ? `${emoji} ` : '';
    const formattedMessage = `[${timestamp}] [${elapsed.padStart(8)}] [${level.toUpperCase()}] ${prefix}${message}`;
    
    // In GitHub Actions, don't include timestamp in debug messages
    return this.debugMode && level === 'debug' 
      ? message // Just show the raw message for debug in GitHub Actions
      : formattedMessage;
  }

  public debug(message: string, data?: unknown): void {
    if (!this.debugMode) return;
    
    const fullMessage = this.formatMessage('debug', message, '🐛');
    core.debug(fullMessage);
    
    if (data !== undefined) {
      // For objects, log each property on a new line for better readability
      if (typeof data === 'object' && data !== null) {
        core.debug('Details:');
        for (const [key, value] of Object.entries(data)) {
          core.debug(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
      } else {
        core.debug(`Value: ${data}`);
      }
    }
  }

  public info(message: string, emoji = 'ℹ️'): void {
    const fullMessage = this.formatMessage('info', message, emoji);
    core.info(fullMessage);
  }

  public success(message: string): void {
    this.info(message, '✅');
  }

  public warn(message: string): void {
    const fullMessage = this.formatMessage('warn', message, '⚠️');
    core.warning(fullMessage);
  }

  public error(message: string, error?: unknown): void {
    const fullMessage = this.formatMessage('error', message, '❌');
    core.error(fullMessage);
    
    if (error instanceof Error) {
      core.error(error.message);
      if (error.stack) {
        core.debug(error.stack);
      }
    } else if (error) {
      core.error(String(error));
    }
  }

  public startGroup(title: string): void {
    core.startGroup(`🚀 ${title}`);
  }

  public endGroup(): void {
    core.endGroup();
  }

  public separator(): void {
    if (this.debugMode) {
      core.info('─'.repeat(80));
    }
  }

  public banner(message: string): void {
    if (!this.debugMode) return;
    
    const banner = `
╔${'═'.repeat(message.length + 2)}╗
║ ${message} ║
╚${'═'.repeat(message.length + 2)}╝`;
    
    core.info(banner);
  }
}
