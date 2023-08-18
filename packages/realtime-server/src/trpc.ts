import { TRPCError, initTRPC } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

export const createWSContext = async (opts: CreateWSSContextFnOptions) => {
  const sid = opts.res['sid'];
  return { sid, ws: opts.res };
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createWSContext>().create();

const hasSessionId = t.middleware(async (opts) => {
  const sid = opts.ctx.ws['sid'];
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
export const publicProcedure = t.procedure;
export const sessionProcedure = t.procedure.use(hasSessionId);
