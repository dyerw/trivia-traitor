import z from 'zod';
import {
  router,
  publicProcedure,
  createWSContext,
  createHTTPContext,
  sessionProcedure,
} from './trpc';
import { observable } from '@trpc/server/observable';
import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import {
  createLobby,
  joinLobby,
  subscribeToLobbyChanged,
  Lobby,
  startGame,
  isLobbyOwner,
} from './lobbies-subject';
import cookie from 'cookie';

import { tap } from 'rxjs';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import { v4 as uuidV4 } from 'uuid';
import { TRPCError } from '@trpc/server';

const appRouter = router({
  lobbyCreate: sessionProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async (opts) => {
      return createLobby(opts.input.nickname, opts.ctx.sessionId);
    }),
  lobbyJoin: sessionProcedure
    .input(z.object({ nickname: z.string(), code: z.string() }))
    .mutation(async (opts) => {
      return joinLobby(opts.input.nickname, opts.input.code);
    }),
  onLobbyChanged: sessionProcedure
    .input(z.object({ code: z.string() }))
    .subscription((opts) => {
      return observable<Lobby>((emit) => {
        const lobby$ = subscribeToLobbyChanged(opts.input.code);
        const subscription = lobby$.pipe(tap(emit.next)).subscribe();

        return () => {
          subscription.unsubscribe();
        };
      });
    }),
  gameStart: sessionProcedure
    .input(z.object({ code: z.string() }))
    .mutation((opts) => {
      if (!isLobbyOwner(opts.input.code, opts.ctx.sessionId)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return startGame(opts.input.code);
    }),
});

const sessionRouter = router({
  registerSession: publicProcedure.mutation(async (opt) => {
    const sessionId = uuidV4();

    opt.ctx.res.setHeader(
      'Set-Cookie',
      cookie.serialize('sessionId', sessionId)
    );
  }),
});

export type SessionRouter = typeof sessionRouter;

createHTTPServer({
  middleware: cors(),
  router: sessionRouter,
  createContext: createHTTPContext,
}).listen(3002);

export type AppRouter = typeof appRouter;

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSContext,
});

wss.on('connection', (ws) => {
  console.log(`++ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`-- Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');
process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
