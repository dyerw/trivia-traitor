import z from 'zod';
import {
  router,
  createWSContext,
  sessionProcedure,
  publicProcedure,
} from './trpc';
import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import logger from './logger';
import http from 'http';

import { v4 as uuidV4 } from 'uuid';
import { generateLobbyCode } from './utils';
import { webSocketSelector, clientLobbySelector } from './state/selectors';
import { TRPCError } from '@trpc/server';

const appRouter = router({
  registerSession: publicProcedure
    .input(z.object({ sid: z.nullable(z.string()) }))
    .mutation(async (opts) => {
      // Already an sid attached to this websocket
      if (opts.ctx.sid !== undefined) {
        logger.info(
          'registerSession called with existing sessionId on websocket'
        );
        return opts.ctx.sid;
      }

      if (opts.input.sid === undefined) {
        logger.info('Generating new sessionId');
      } else {
        // Check that session id isn't used by an existing connection
        const websocket = opts.ctx.select(webSocketSelector);
        if (
          websocket !== undefined &&
          websocket.readyState === ws.WebSocket.OPEN
        ) {
          logger.info(
            `Websocket connection rejected because SessionID ${opts.input.sid} in use by open Websocket`
          );
          throw new TRPCError({
            message: 'SessionID already in use by open websocket',
            code: 'BAD_REQUEST',
          });
        }
        logger.info('Using sessionId supplied by client', {
          sessionId: opts.input.sid,
        });
      }

      const sid = opts.input.sid ?? uuidV4();

      // Not positive that this is the best place to keep the sid,
      // but it's available in the context this way
      logger.info('Assigning sid to websocket', { sid });
      opts.ctx.dispatch({
        type: 'SESSION_CONNECT',
        payload: { websocket: opts.ctx.ws },
      });
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
          code: generateLobbyCode(),
        },
      });
      return opts.ctx.select(clientLobbySelector);
    }),
  lobbyJoin: sessionProcedure
    .input(z.object({ nickname: z.string(), code: z.string() }))
    .mutation(async (opts) => {
      opts.ctx.dispatch({
        type: 'JOIN_LOBBY',
        payload: {
          nickname: opts.input.nickname,
          code: opts.input.code,
        },
      });
      return opts.ctx.select(clientLobbySelector);
    }),
  onLobbyChanged: sessionProcedure.subscription((opts) => {
    return opts.ctx.observe(clientLobbySelector);
  }),
  gameStart: sessionProcedure
    .input(z.object({ code: z.string() }))
    .mutation((opts) => {
      // TODO: Re-implement in redux w/e
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
  logger.info('Websocket connected', { numberOfClients: wss.clients.size });
  ws.once('close', () => {
    logger.info('Websocket disconnected', {
      numberOfClients: wss.clients.size,
    });
  });
});
logger.info('WebSocket Server listening on ws://localhost:3001');
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});

// Only used for healthchecks
http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end();
  })
  .listen(3002, 'localhost', () => {
    logger.info('HTTP Server listening on http://localhost:3002');
  });
