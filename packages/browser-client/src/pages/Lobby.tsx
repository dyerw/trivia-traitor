import { For, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { state } from '../store';
import { client } from '../utils/trpc';
export default function Lobby() {
  const startGame = async () => {
    await client.gameStart.mutate();
  };
  return (
    <div>
      <Show when={state.lobby === undefined}>
        <Navigate href={'/'} />
      </Show>
      <div>Lobby</div>
      <div>{state.lobby?.code}</div>
      <div>Players:</div>
      <ul>
        <For each={state.lobby?.players}>
          {(player) => (
            <li>
              {player.nickname} {player.isYou && '(you)'}{' '}
              {player.isOwner && '(owner)'}
            </li>
          )}
        </For>
      </ul>
      <button onClick={() => startGame()}>14</button>
    </div>
  );
}
