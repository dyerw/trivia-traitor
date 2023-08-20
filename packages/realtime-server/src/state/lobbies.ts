import { Action } from './actions';
import { produce } from 'immer';
import logger from '../logger';

type Game = {
  traitorSessionId: string;
  currentQuestionId: string;
  // SessionId -> AnswerId
  answerVotes: Record<string, string>;
  questionsWrong: number;
  questionsCorrect: number;
};

type LobbyGameState =
  | {
      inGame: true;
      game: Game;
    }
  | { inGame: false };

export type Lobby = {
  code: string;
  ownerSessionId: string;
  playerSessionIds: string[];
  gameState: LobbyGameState;
};

export type LobbiesState = {
  lobbies: Lobby[];
};

export const initialLobbiesState: LobbiesState = { lobbies: [] };

export const lobbiesReducer = (
  state: LobbiesState,
  action: Action,
  getSessionId: () => string
) => {
  const sessionId = getSessionId();
  switch (action.type) {
    case 'START_GAME':
      return produce(state, (draft) => {
        const lobby = draft.lobbies.find((l) => l.ownerSessionId === sessionId);
        if (lobby === undefined) {
          return;
        }
        if (lobby.gameState.inGame) {
          return;
        }
        lobby.gameState = {
          inGame: true,
          game: {
            traitorSessionId: action.payload.traitorSessionId,
            currentQuestionId: action.payload.initialQuestionId,
            questionsCorrect: 0,
            questionsWrong: 0,
            answerVotes: {},
          },
        };
      });
    case 'JOIN_LOBBY':
      return produce(state, (draft) => {
        const lobby = draft.lobbies.find((l) => (l.code = action.payload.code));
        if (lobby === undefined) {
          logger.error(
            'JOIN_LOBBY action dispatched with non-existant lobby code',
            { action }
          );
          return state;
        }
        lobby.playerSessionIds.push(sessionId);
      });
    case 'CREATE_LOBBY':
      return produce(state, (draft) => {
        draft.lobbies.push({
          code: action.payload.code,
          ownerSessionId: sessionId,
          playerSessionIds: [],
          gameState: {
            inGame: false,
          },
        });
      });
    default:
      return state;
  }
};
