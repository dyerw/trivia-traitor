import { Action } from './actions';
import { produce } from 'immer';
import logger from '../logger';
import _ from 'radash';
import questions from '../questions';

type Game = {
  traitorSessionId: string;
  currentQuestionId: string;
  // SessionId -> AnswerId
  answerVotes: Record<string, string>;
  questionsWrong: number;
  questionsCorrect: number;
  previousQuestionIds: string[];
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
    case 'NEXT_QUESTION':
      return produce(state, (draft) => {
        // FIXME: dedupe these checks, types!!!!
        // You better be in a lobby
        const lobby = draft.lobbies.find(
          (l) =>
            l.ownerSessionId === sessionId ||
            l.playerSessionIds.includes(sessionId)
        );
        if (lobby === undefined) {
          logger.error('cannot vote while not in lobby', {
            sessionId,
            lobbies: draft.lobbies,
          });
          return;
        }
        // You better be in a game
        if (!lobby.gameState.inGame) {
          logger.error('cannot vote while not in game', { sessionId });
          return;
        }

        const game = lobby.gameState.game;

        // Everyone has to have voted
        if (
          Object.keys(game.answerVotes).length !==
          lobby.playerSessionIds.length + 1
        ) {
          logger.error('cannot vote while not in game', {
            sessionId,
            answerVotes: game.answerVotes,
          });
          return;
        }

        // lmao check out this one liner, you're just gonna have to trust me
        // tie-breaker is arbitrary
        const mostVotedAnswerId = _.max(
          Object.entries(
            _.counting(Object.values(game.answerVotes), (x) => x)
          ).map(([answerId, count]) => ({ answerId, count })),
          ({ count }) => count
        )?.answerId;
        if (mostVotedAnswerId === null) {
          return;
        }

        if (
          mostVotedAnswerId === questions[game.currentQuestionId].correctAnswer
        ) {
          game.questionsCorrect++;
        } else {
          game.questionsWrong++;
        }

        const validNextQuestions = Object.keys(questions).filter(
          (qid) => !game.previousQuestionIds.includes(qid)
        );

        const nextQuestion = _.draw(validNextQuestions);

        if (nextQuestion === null) {
          // ideally this won't happen once there's more questions
          // and game length is specified
          throw new Error('ALL OUT OF QUESTIONS');
        }

        game.answerVotes = {};
        game.previousQuestionIds.push(game.currentQuestionId);
        game.currentQuestionId = nextQuestion;
      });
    case 'VOTE_FOR_ANSWER':
      return produce(state, (draft) => {
        // You better be in a lobby
        const lobby = draft.lobbies.find(
          (l) =>
            l.ownerSessionId === sessionId ||
            l.playerSessionIds.includes(sessionId)
        );
        if (lobby === undefined) {
          logger.error('cannot vote while not in lobby', {
            sessionId,
            lobbies: draft.lobbies,
          });
          return;
        }
        // You better be in a game
        if (!lobby.gameState.inGame) {
          logger.error('cannot vote while not in game', { sessionId });
          return;
        }
        const answerVotes = lobby.gameState.game.answerVotes;
        // No double voting
        if (Object.keys(answerVotes).includes(sessionId)) {
          logger.error('cannot vote more than once', { sessionId });
          return;
        }

        answerVotes[sessionId] = action.payload.answerId;
      });
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
            previousQuestionIds: [],
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
