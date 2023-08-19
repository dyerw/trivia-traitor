import { Action } from './actions';
import { produce } from 'immer';

export type Lobby = {
  code: string;
  ownerSessionId: string;
  playerSessionIds: string[];
};

export type LobbiesState = {
  lobbies: Lobby[];
};

export const initialLobbiesState: LobbiesState = { lobbies: [] };

export const lobbiesReducer = (
  state: LobbiesState,
  action: Action,
  sessionId: string
) => {
  switch (action.type) {
    case 'JOIN_LOBBY':
      return produce(state, (draft) => {
        draft.lobbies
          .find((l) => (l.code = action.payload.code))
          .playerSessionIds.push(sessionId);
      });
    case 'CREATE_LOBBY':
      return produce(state, (draft) => {
        draft.lobbies.push({
          code: action.payload.code,
          ownerSessionId: sessionId,
          playerSessionIds: [],
        });
      });
    default:
      return state;
  }
};
