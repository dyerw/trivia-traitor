import { State } from './store';
import { WebSocket } from 'ws';

export type ClientLobby = {
  ownerNickname: string;
  otherNicknames: string[];
  code: string;
};

export const clientLobbySelector =
  (sessionId: string) =>
  (state: State): ClientLobby => {
    const lobby = state.lobbies.lobbies.find((lobby) =>
      [lobby.ownerSessionId, ...lobby.playerSessionIds].includes(sessionId)
    );
    const sessionIdToNickname = (sid: string): string | undefined => {
      const session = state.sessions.sessions[sid];
      return session.inLobby ? session.nickname : undefined;
    };
    return {
      code: lobby.code,
      ownerNickname: sessionIdToNickname(lobby.ownerSessionId),
      otherNicknames: lobby.playerSessionIds.map(sessionIdToNickname),
    };
  };

export const webSocketSelector =
  (sessionId: string) =>
  (state: State): WebSocket | undefined =>
    state.sessions.sessions[sessionId]?.websocket;
