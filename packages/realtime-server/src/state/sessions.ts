import { produce } from 'immer';
import type { Action } from './actions';
import { WebSocket } from 'ws';

type Session = (
  | {
      inLobby: false;
    }
  | {
      inLobby: true;
      nickname: string;
    }
) & {
  websocket: WebSocket;
};

export type SessionsState = {
  sessions: Record<string, Session>;
};

export const initialSessionsState = {
  sessions: {},
};

export const sessionsReducer = (
  state: SessionsState,
  action: Action,
  getSessionId: () => string
) => {
  switch (action.type) {
    case 'SESSION_CONNECT': {
      return produce(state, (draft) => {
        draft.sessions[getSessionId()] = {
          inLobby: false,
          websocket: action.payload.websocket,
        };
      });
    }
    case 'JOIN_LOBBY':
    case 'CREATE_LOBBY':
      return produce(state, (draft) => {
        const sessionId = getSessionId();
        draft.sessions[sessionId] = {
          ...draft.sessions[sessionId],
          inLobby: true,
          nickname: action.payload.nickname,
        };
      });
    default:
      return state;
  }
};
