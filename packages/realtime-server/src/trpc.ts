import { TRPCError, initTRPC } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import {
  createDispatch,
  createObserve,
  createSelect,
  createStore,
} from './state/store';
import logger from './logger';

const store = createStore();

export const createWSContext = async (opts: CreateWSSContextFnOptions) => {
  const sid: string = opts.res['sid'];
  logger.debug('createWSContext', { sid });
  const dispatch = createDispatch(sid, store);
  const observe = createObserve(sid, store);
  const select = createSelect(sid, store);
  return { sid, ws: opts.res, dispatch, observe, select };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createWSContext>().create();

const loggerMiddleware = t.middleware(async (opts) => {
  logger.info('Procedure Called', { path: opts.path, input: opts.input });
  return opts.next(opts);
});

const hasSessionId = t.middleware(async (opts) => {
  const sid = opts.ctx.ws['sid'];
  logger.debug('Validating session id', { sid: opts.ctx.ws['sid'] });
  if (sid === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      sid,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);
export const sessionProcedure = t.procedure
  .use(loggerMiddleware)
  .use(hasSessionId);
