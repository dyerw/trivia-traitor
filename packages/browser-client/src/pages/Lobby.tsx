import { For, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { state } from '../store';
import { client } from '../utils/trpc';
export default function Lobby() {
  const startGame = async () => {
    await client.gameStart.mutate({
      code: state.lobby?.lobbyCode || '',
      sessionId: state?.sessionId || '',
    });
  };
  return (
    <div>
      <Show when={state.lobby === undefined}>
        <Navigate href={'/'} />
      </Show>
      <div>Lobby</div>
      <div>{state.lobby?.lobbyCode}</div>
      <div>You are: {state.lobby?.nickname}</div>
      <div>Other Players:</div>
      <ul>
        <For each={state.lobby?.otherPlayers}>{(op) => <li>{op}</li>}</For>
      </ul>
      <button onClick={() => startGame()}>14</button>
    </div>
  );
}
