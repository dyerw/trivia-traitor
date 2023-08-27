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
  connected: boolean;
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
  const sessionId = getSessionId();
  switch (action.type) {
    case 'CLIENT_DISCONNECT': {
      return produce(state, (draft) => {
        draft.sessions[sessionId].connected = false;
      });
    }
    case 'SESSION_CONNECT': {
      return produce(state, (draft) => {
        if (sessionId in draft.sessions) {
          draft.sessions[sessionId].connected = true;
          draft.sessions[sessionId].websocket = action.payload.websocket;
          return;
        }
        draft.sessions[getSessionId()] = {
          inLobby: false,
          websocket: action.payload.websocket,
          connected: true,
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
