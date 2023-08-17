import styles from './App.module.css';
import { For, Show, createSignal } from 'solid-js';

import { client } from './utils/trpc';

type Lobby = Awaited<ReturnType<typeof client.lobbyCreate.mutate>> | null;

function App() {
  const [lobbyCode, setLobbyCode] = createSignal('');
  const [nickname, setNickname] = createSignal('');

  const [lobbyState, setLobbyState] = createSignal<Lobby | null>(null);

  const subscribeToLobby = () => {
    const _lobbyState = lobbyState();
    if (_lobbyState == null) {
      console.log('wtf???');
      return;
    }

    client.onLobbyChanged.subscribe(
      { code: _lobbyState.code },
      {
        onData(lobby) {
          setLobbyState(lobby);
        },
      }
    );
  };

  const createLobby = async () => {
    if (nickname() === '') {
      console.log('NO!');
      return;
    }
    const lobby = await client.lobbyCreate.mutate({ nickname: nickname() });
    setLobbyState(lobby);
    subscribeToLobby();
  };

  const joinLobby = async () => {
    if (nickname() === '') {
      console.log('NO!');
      return;
    }
    const lobby = await client.lobbyJoin.mutate({
      code: lobbyCode(),
      nickname: nickname(),
    });
    setLobbyState(lobby);
    subscribeToLobby();
  };

  return (
    <div class={styles.App}>
      <Show
        when={lobbyState() !== null}
        fallback={<div>get in a lobby dumass</div>}
      >
        <div>{lobbyState()?.code}</div>
        <ul>
          <For
            each={[
              lobbyState()?.ownerNickname ?? 'NULL',
              ...(lobbyState()?.otherNicknames ?? []),
            ]}
            fallback={<div>Loading...</div>}
          >
            {(item) => <div>{item}</div>}
          </For>
        </ul>
      </Show>
      <input
        placeholder="Lobby Code"
        value={lobbyCode()}
        onInput={(e) => setLobbyCode(e.currentTarget.value)}
      />
      <input
        placeholder="Nickname"
        value={nickname()}
        onInput={(e) => setNickname(e.currentTarget.value)}
      />
      <button onClick={() => joinLobby()}>Join Lobby</button>
      <button onClick={() => createLobby()}>Create Lobby</button>
    </div>
  );
}

export default App;
