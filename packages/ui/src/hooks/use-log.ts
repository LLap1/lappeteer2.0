import { useCallback } from 'react';
import { type Logger, type Log, type Project } from '@overlays/types/logs';

export type UseLogOptions = {
  project: Project;
};

export const useLog = (logger: Logger, options: UseLogOptions) => {
  const { project } = options;

  const logInfo = useCallback(
    (log: Omit<Log, 'level' | 'project'>) => logger.info({ ...log, project }),
    [logger, project],
  );

  const logWarn = useCallback(
    (log: Omit<Log, 'level' | 'project'>) => logger.warn({ ...log, project }),
    [logger, project],
  );

  const logError = useCallback(
    (log: Omit<Log, 'level' | 'project' | 'error'>, error: unknown) => logger.error({ ...log, project }, error),
    [logger, project],
  );

  const logDebug = useCallback(
    (log: Omit<Log, 'level' | 'project'>) => logger.debug({ ...log, project }),
    [logger, project],
  );

  return {
    logInfo,
    logWarn,
    logError,
    logDebug,
  };
};
