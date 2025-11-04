import { z } from 'zod';

export const LogLevel = ['info', 'warn', 'error', 'debug'] as const;
export type LogLevel = (typeof LogLevel)[number];

export const Project = ['overlays', 'overlays-api', 'overlays-web'] as const;
export type Project = (typeof Project)[number];

export const LogSchema = z.object({
  level: z.enum(LogLevel),
  project: z.enum(Project),
  message: z.string(),
  props: z.any(),
  error: z.any().optional(),
});

export abstract class Logger {
  abstract log(log: Log): void;

  info(log: Omit<Log, 'level'>): void {
    this.log({ ...log, level: 'info' });
  }
  warn(log: Omit<Log, 'level'>): void {
    this.log({ ...log, level: 'warn' });
  }
  error(log: Omit<Log, 'error' | 'level'>, error: unknown): void {
    this.log({ ...log, error, level: 'error' });
  }
  debug(log: Omit<Log, 'level'>): void {
    this.log({ ...log, level: 'debug' });
  }
}

export type Log = {
  [K in LogLevel]: {
    level: K;
    project: Project;
    message: string;
    props?: object;
  } & (K extends 'error' ? { error: unknown } : {});
}[LogLevel];
