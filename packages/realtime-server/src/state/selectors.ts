import { ClientGame, ClientLobby } from '../client';
import { Lobby } from './lobbies';
import { State } from './store';
import questions from '../questions';

export const clientLobbySelector =
  (getSessionId: () => string) =>
  (state: State): ClientLobby | undefined => {
    const sessionId = getSessionId();
    const lobby = state.lobbies.lobbies.find((lobby) =>
      [lobby.ownerSessionId, ...lobby.playerSessionIds].includes(sessionId)
    );

    const allSessionIds = allSessionIdsInLobby(getSessionId)(state);
    if (lobby === undefined || allSessionIds === undefined) {
      return undefined;
    }
    const sessionIdToNickname = (sid: string): string | undefined => {
      const session = state.sessions.sessions[sid];
      return session.inLobby ? session.nickname : undefined;
    };

    let game: ClientGame = { isStarted: false };

    if (lobby.gameState.inGame) {
      const isStarted = true;
      const question = questions[lobby.gameState.game.currentQuestionId];
      const currentQuestionText = question.text;
      const answers = question.answers;
      const totalVotesSubmitted = Object.keys(
        lobby.gameState.game.answerVotes
      ).length;

      const yourVoteAnswerId: string | undefined =
        lobby.gameState.game.answerVotes[sessionId];

      if (lobby.gameState.game.traitorSessionId === sessionId) {
        game = {
          isStarted,
          currentQuestionText,
          isTraitor: true,
          answers,
          totalVotesSubmitted,
          yourVoteAnswerId,
          explanation: question.explanation,
          correctAnswerId: question.correctAnswer,
        };
      } else {
        game = {
          isStarted,
          currentQuestionText,
          isTraitor: false,
          answers,
          totalVotesSubmitted,
          yourVoteAnswerId,
        };
      }
    }

    return {
      code: lobby.code,
      players: allSessionIds.map((sid) => ({
        nickname: sessionIdToNickname(sid) ?? 'FIXME: session id not in lobby',
        isOwner: sid === lobby.ownerSessionId,
        isYou: sid === sessionId,
      })),
      game,
    };
  };

export const lobbySelector =
  (getSessionId: () => string) =>
  (state: State): Lobby | undefined => {
    const sessionId = getSessionId();
    return state.lobbies.lobbies.find(
      (lobby) =>
        lobby.ownerSessionId === sessionId ||
        lobby.playerSessionIds.includes(sessionId)
    );
  };

export const allSessionIdsInLobby =
  (getSessionId: () => string) =>
  (state: State): string[] | undefined => {
    const lobby = lobbySelector(getSessionId)(state);
    if (lobby === undefined) {
      return undefined;
    }
    return [lobby.ownerSessionId, ...lobby.playerSessionIds];
  };
