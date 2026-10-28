import 'server-only';
import { after } from 'next/server';
import { createActionFactory } from './action';
import { logger } from './logger';

/**
 * Use in "use server" files:
 *   export const saveX = defineAction({ name: 'x.save', schema, handler: async (input, ctx) => ... });
 */
export const defineAction = createActionFactory({
  logger,
  schedule: (task) => {
    after(task);
  },
});
