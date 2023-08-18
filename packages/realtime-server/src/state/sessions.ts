import type { Action } from './actions';

type Session = {
  nickname: string;
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
  sessionId: string
) => {
  switch (action.type) {
    case 'JOIN_LOBBY':
    case 'CREATE_LOBBY':
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            nickname: action.payload.nickname,
          },
        },
      };
  }
};
