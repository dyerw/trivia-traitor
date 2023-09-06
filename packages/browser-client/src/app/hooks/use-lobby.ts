import { atom, useAtom } from 'jotai';
import { client } from '../../trpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { ClientLobby } from '@trivia-traitor/realtime-server';

const lobbyAtom = atom<ClientLobby | undefined>(undefined);

export const useLobby = () => {
  const [lobby, setLobby] = useAtom(lobbyAtom);

  const subscribe = () => {
    client.onLobbyChanged.subscribe(undefined, {
      onData(lobby: ClientLobby | undefined) {
        if (lobby === undefined) {
          console.warn('subscribed to undefined lobby');
          return;
        }
        setLobby(lobby);
      },
    });
  };

  const lobbyJoined = (lobby: ClientLobby) => {
    // Immediately update state
    setLobby(lobby);
    // Get further updates
    subscribe();
  };
  return { lobbyJoined, lobby };
};
