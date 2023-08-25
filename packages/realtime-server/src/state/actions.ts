import { WebSocket } from 'ws';
import { GameOptions } from './lobbies';

export type Action =
  | {
      type: 'CLIENT_DISCONNECT';
    }
  | {
      type: 'SESSION_CONNECT';
      payload: {
        websocket: WebSocket;
      };
    }
  | {
      type: 'CREATE_LOBBY';
      payload: {
        code: string;
        nickname: string;
        gameOptions: GameOptions;
      };
    }
  | {
      type: 'JOIN_LOBBY';
      payload: {
        code: string;
        nickname: string;
      };
    }
  | {
      type: 'START_GAME';
      payload: {
        traitorSessionId: string;
        initialQuestionId: string;
      };
    }
  | {
      type: 'VOTE_FOR_ANSWER';
      payload: {
        answerId: string;
      };
    }
  | {
      type: 'NEXT_QUESTION';
    };
