import z from 'zod';
import { router, publicProcedure } from './trpc';
import { observable } from '@trpc/server/observable';
import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';

import {
  createLobby,
  joinLobby,
  subscribeToLobbyChanged,
  Lobby,
} from './lobbies-subject';
import { tap } from 'rxjs';

const appRouter = router({
  lobbyCreate: publicProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async (opts) => {
      return createLobby(opts.input.nickname);
    }),
  lobbyJoin: publicProcedure
    .input(z.object({ nickname: z.string(), code: z.string() }))
    .mutation(async (opts) => {
      return joinLobby(opts.input.nickname, opts.input.code);
    }),
  onLobbyChanged: publicProcedure
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
});

export type AppRouter = typeof appRouter;

const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({ wss, router: appRouter });

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
