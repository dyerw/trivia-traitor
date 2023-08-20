import { TRPCError, initTRPC } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import {
  createDispatch,
  createObserve,
  createSelect,
  createStore,
  getSessionIdFromWebSocket,
} from './state/store';
import logger from './logger';

const store = createStore();

export const createWSContext = async (opts: CreateWSSContextFnOptions) => {
  logger.debug('createWSContext');
  const ws = opts.res;
  const dispatch = createDispatch(ws, store);
  const observe = createObserve(ws, store);
  const select = createSelect(ws, store);
  const getState = () => store.getValue();
  return { ws, dispatch, observe, select, getState };
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
  getSessionIdFromWebSocket(opts.ctx.ws, store)();
  return opts.next(opts);
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
