import { State } from './store';

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
    const sessionIdToNickname = (sid: string) =>
      state.sessions.sessions[sid].nickname;
    return {
      code: lobby.code,
      ownerNickname: sessionIdToNickname(lobby.ownerSessionId),
      otherNicknames: lobby.playerSessionIds.map(sessionIdToNickname),
    };
  };
