import { initTRPC } from '@trpc/server';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

export const createContext = async (opts: CreateWSSContextFnOptions) => {
  opts.req;

  return {};
};

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
