import { createStore, produce } from 'solid-js/store';
import { client } from './utils/trpc';

type Lobby = {
  nickname: string;
  lobbyCode: string;
  otherPlayers: string[];
};

type AppState = {
  // undefined if you have not joined lobby
  lobby?: Lobby;
  sessionId?: string;
};

const initialState: AppState = {};

const [_state, setStateStore] = createStore(initialState);

export const state = _state;

export const sessionIdCreated = (sessionId: string) => {
  setStateStore(
    produce((s) => {
      s.sessionId = sessionId;
    })
  );
};

export const lobbyJoined = (
  nickname: string,
  lobbyCode: string,
  existingPlayers: string[] = []
) => {
  setStateStore(
    produce((s) => {
      s.lobby = {
        nickname,
        lobbyCode,
        otherPlayers: existingPlayers,
      };
    })
  );
  subscribeToLobby();
};

export const lobbyStateUpdated = (lobby: Lobby) =>
  setStateStore(
    produce((s) => {
      s.lobby = lobby;
    })
  );

export const getOtherPlayers = (myNickname: string, nicknames: string[]) =>
  nicknames.filter((nn) => nn !== myNickname);

const subscribeToLobby = () => {
  if (state.lobby === undefined) {
    console.warn('Attempting to subscribe to undefined lobby');
    return;
  }

  client.onLobbyChanged.subscribe(
    { code: state.lobby.lobbyCode },
    {
      onData(lobby) {
        const prevLobby = state.lobby;
        if (prevLobby !== undefined) {
          lobbyStateUpdated({
            lobbyCode: lobby.code,
            nickname: prevLobby.nickname,
            otherPlayers: getOtherPlayers(prevLobby.nickname, lobby.nicknames),
          });
        }
      },
    }
  );
};
