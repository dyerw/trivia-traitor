import { WebSocket } from 'ws';

export type Action =
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
    };
