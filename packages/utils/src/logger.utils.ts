/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Logger } from '@nestjs/common';
import 'reflect-metadata';

function filterFiles(data: any): any {
  if (
    data instanceof File ||
    data instanceof Blob ||
    data instanceof Uint8Array ||
    data instanceof ArrayBuffer ||
    data instanceof Buffer
  ) {
    return '[FILE]';
  }
  if (Array.isArray(data)) {
    return data.map(item => filterFiles(item));
  }

  if (typeof data === 'object') {
    const filtered: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        filtered[key] = filterFiles(data[key]);
      }
    }
    return filtered;
  }

  return data;
}

export function Log(logger: Logger): any {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const startTime = Date.now();
      logger.log({
        method: propertyKey,
        message: `start`,
        args: filterFiles(args),
        startTime: new Date(startTime).toISOString(),
      });
      try {
        const result = originalMethod.apply(this, args);
        const endTime = Date.now();
        logger.log({
          method: propertyKey,
          message: `finish`,
          result: filterFiles(result),
          endTime: new Date(endTime).toISOString(),
          executionTime: `${endTime - startTime} ms`,
        });
        return result;
      } catch (error) {
        logger.error({
          method: propertyKey,
          message: `error`,
          error: (error as Error)?.message,
        });
        throw error;
      }
    };

    return descriptor;
  };
}
