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
import _ from 'radash';

import { v4 as uuidV4 } from 'uuid';
import { generateLobbyCode } from './utils';
import { clientLobbySelector, allSessionIdsInLobby } from './state/selectors';
import { TRPCError } from '@trpc/server';
import { ClientLobby } from './client';

import questions from './questions';

export const appRouter = router({
  registerSession: publicProcedure
    .input(z.object({ sid: z.nullable(z.string()) }))
    .mutation(async (opts) => {
      if (opts.input.sid === null) {
        const newSessionId = uuidV4();

        logger.info(`Generating new sessionId ${newSessionId}`);

        opts.ctx.dispatch(
          {
            type: 'SESSION_CONNECT',
            payload: { websocket: opts.ctx.ws },
          },
          newSessionId
        );
        return newSessionId;
      } else {
        logger.info(
          'registerSession called with existing sessionId on websocket'
        );
        // Check that session id isn't used by an existing connection
        const websocket: ws.WebSocket | undefined =
          opts.ctx.getState().sessions.sessions[opts.input.sid]?.websocket;
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
        opts.ctx.dispatch(
          {
            type: 'SESSION_CONNECT',
            payload: { websocket: opts.ctx.ws },
          },
          opts.input.sid
        );
        return opts.input.sid;
      }
    }),
  lobbyCreate: sessionProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async (opts): Promise<ClientLobby> => {
      opts.ctx.dispatch({
        type: 'CREATE_LOBBY',
        payload: {
          nickname: opts.input.nickname,
          code: generateLobbyCode(),
        },
      });
      const clientLobby = opts.ctx.select(clientLobbySelector);
      if (clientLobby === undefined) {
        throw new TRPCError({
          message: 'LobbyCreate failed',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
      return clientLobby;
    }),
  lobbyJoin: sessionProcedure
    .input(z.object({ nickname: z.string(), code: z.string() }))
    .mutation(async (opts): Promise<ClientLobby> => {
      opts.ctx.dispatch({
        type: 'JOIN_LOBBY',
        payload: {
          nickname: opts.input.nickname,
          code: opts.input.code,
        },
      });
      const clientLobby = opts.ctx.select(clientLobbySelector);
      if (clientLobby === undefined) {
        throw new TRPCError({
          message: 'LobbyJoin failed',
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
      return clientLobby;
    }),
  onLobbyChanged: sessionProcedure.subscription((opts) => {
    return opts.ctx.observe(clientLobbySelector);
  }),
  gameStart: sessionProcedure.mutation((opts) => {
    const allSessionIds = opts.ctx.select(allSessionIdsInLobby);
    if (allSessionIds === undefined) {
      throw new TRPCError({
        message: 'Cannot start game when not in lobby',
        code: 'PRECONDITION_FAILED',
      });
    }
    const traitorSessionId = _.draw(allSessionIds);
    // TODO: Implement player limit
    if (traitorSessionId === null) {
      throw new TRPCError({
        message: 'At least two players required to start game',
        code: 'PRECONDITION_FAILED',
      });
    }

    const initialQuestionId = _.draw(Object.keys(questions));
    if (initialQuestionId === null) {
      throw new TRPCError({
        message: 'There are no questions?',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
    opts.ctx.dispatch({
      type: 'START_GAME',
      payload: {
        traitorSessionId,
        initialQuestionId,
      },
    });
  }),
});

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
