import z from 'zod';
import {
  router,
  createWSContext,
  sessionProcedure,
  publicProcedure,
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

import { tap } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';
import { TRPCError } from '@trpc/server';

const appRouter = router({
  registerSession: publicProcedure
    .input(z.object({ sid: z.nullable(z.string()) }))
    .mutation(async (opts) => {
      // Already an sid attached to this websocket
      if (opts.ctx.sid !== undefined) {
        return opts.ctx.sid;
      }

      const sid = opts.input.sid ?? uuidV4();

      // Not positive that this is the best place to keep the sid,
      // but it's available in the context this way
      opts.ctx.ws['sid'] = sid;
      return sid;
    }),
  lobbyCreate: sessionProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async (opts) => {
      opts.ctx.dispatch({
        type: 'CREATE_LOBBY',
        payload: {
          nickname: opts.input.nickname,
          code: 'FOO',
        },
      });
      return createLobby(opts.input.nickname, opts.ctx.sid);
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
      if (!isLobbyOwner(opts.input.code, opts.ctx.sid)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return startGame(opts.input.code);
    }),
});

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
