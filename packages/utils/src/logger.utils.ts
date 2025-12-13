/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import 'reflect-metadata';

export function Log(logger: Logger): any {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value; // Save original method

    descriptor.value = function (...args: any[]) {
      const name = `${target.constructor.name}.${propertyKey}`;
      const startTime = new Date();
      // Replace with new function
      logger.log(`${name} : Starting`, {
        args,
        startTime: startTime.toISOString(),
      });
      try {
        const result = originalMethod.apply(this, args); // Call original
        const endTime = new Date();
        logger.log(`${name} : Finished`, {
          result,
          endTime: endTime.toISOString(),
          executionTime: endTime.getTime() - startTime.getTime(),
        }); // Log after
        return result;
      } catch (error) {
        logger.error(`${name} : Error`, {
          error: (error as Error)?.message,
        });
        throw error;
      }
    };

    return descriptor; // Return modified descriptor
  };
}
