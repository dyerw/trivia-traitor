import { createSignal } from 'solid-js';
import { getOtherPlayers, lobbyJoined } from '../store';
import { useNavigate } from '@solidjs/router';

import { client } from '../utils/trpc';

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

    const lobby = await client.lobbyCreate.mutate({
      nickname: nicknameInput(),
    });
    lobbyJoined(nickname, lobby.code);
    navigate('/lobby', { replace: true });
  };

  const joinLobby = async () => {
    const nickname = nicknameInput();
    const lobbyCode = lobbyCodeInput();
    if (nickname === '' || lobbyCode === '') {
      console.warn('Invalid nickname/lobbyCode');
      return;
    }
    const lobby = await client.lobbyJoin.mutate({
      code: lobbyCode,
      nickname: nickname,
    });
    lobbyJoined(
      nickname,
      lobby.code,
      getOtherPlayers(nickname, lobby.nicknames)
    );
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
