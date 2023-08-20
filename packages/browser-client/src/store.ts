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
};

const initialState: AppState = {};

const [_state, setStateStore] = createStore(initialState);

export const state = _state;

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

const subscribeToLobby = () => {
  if (state.lobby === undefined) {
    console.warn('Attempting to subscribe to undefined lobby');
    return;
  }

  client.onLobbyChanged.subscribe(undefined, {
    onData(lobby) {
      const prevLobby = state.lobby;
      if (prevLobby !== undefined) {
        lobbyStateUpdated({
          lobbyCode: lobby.code,
          nickname: prevLobby.nickname,
          otherPlayers: lobby.otherNicknames,
        });
      }
    },
  });
};
