import { createStore, produce } from 'solid-js/store';
import { client } from './utils/trpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { ClientLobby } from '@trivia-traitor/realtime-server';

type AppState = {
  // undefined if you have not joined lobby
  lobby?: ClientLobby;
};

const initialState: AppState = {};

const [_state, setStateStore] = createStore(initialState);

export const state = _state;

export const lobbyJoined = (clientLobby: ClientLobby) => {
  setStateStore({ lobby: clientLobby });
  subscribeToLobby();
};

export const lobbyStateUpdated = (lobby: ClientLobby) =>
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
    onData(lobby: ClientLobby | undefined) {
      if (lobby === undefined) {
        console.warn('subscribed to undefined lobby');
        return;
      }
      const prevLobby = state.lobby;
      if (prevLobby !== undefined) {
        lobbyStateUpdated(lobby);
      }
    },
  });
};
