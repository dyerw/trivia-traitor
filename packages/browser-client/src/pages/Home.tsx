import { createSignal } from 'solid-js';
import { lobbyJoined } from '../store';
import { useNavigate } from '@solidjs/router';

import { client } from '../utils/trpc';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ClientLobby } from '@trivia-traitor/realtime-server';

export default function Home() {
  const navigate = useNavigate();
  // FIXME: find a fuckin form lib
  const [nicknameInput, setNicknameInput] = createSignal('');
  const [lobbyCodeInput, setLobbyCodeInput] = createSignal('');

  const createLobby = async () => {
    const nickname = nicknameInput();
    if (nickname === '') {
      console.warn('Invalid nickname');
      return;
    }

    const lobby: ClientLobby = await client.lobbyCreate.mutate({
      nickname: nicknameInput(),
    });
    lobbyJoined(lobby);
    navigate('/lobby', { replace: true });
  };

  const joinLobby = async () => {
    const nickname = nicknameInput();
    const lobbyCode = lobbyCodeInput();
    if (nickname === '' || lobbyCode === '') {
      console.warn('Invalid nickname/lobbyCode');
      return;
    }
    const lobby: ClientLobby = await client.lobbyJoin.mutate({
      code: lobbyCode,
      nickname: nickname,
    });
    lobbyJoined(lobby);
    navigate('/lobby', { replace: true });
  };

  return (
    <div>
      <input
        placeholder="Lobby Code"
        value={lobbyCodeInput()}
        onInput={(e) => setLobbyCodeInput(e.currentTarget.value)}
      />
      <input
        placeholder="Nickname"
        value={nicknameInput()}
        onInput={(e) => setNicknameInput(e.currentTarget.value)}
      />
      <button onClick={() => joinLobby()}>Join Lobby</button>
      <button onClick={() => createLobby()}>Create Lobby</button>
    </div>
  );
}
