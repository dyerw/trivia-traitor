import { TRPCError, initTRPC } from '@trpc/server';
import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import cookie from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';

type Context = {
  req?: IncomingMessage;
  res?: ServerResponse;
  sessionId?: string;
};

export const createWSContext = async (
  opts: CreateWSSContextFnOptions
): Promise<Context> => {
  const sessionId = cookie.parse(opts.req.headers.cookie).sessionId;

  return { sessionId };
};

export const createHTTPContext = async (
  opts: CreateHTTPContextOptions
): Promise<Context> => {
  const { req, res } = opts;
  return { req, res };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

const hasSessionId = t.middleware(async (opts) => {
  const { sessionId } = opts.ctx;
  if (sessionId === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      sessionId,
    },
  });
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const sessionProcedure = t.procedure.use(hasSessionId);
