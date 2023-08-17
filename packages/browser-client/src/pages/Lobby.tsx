import { For, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { state } from '../store';
export default function Lobby() {
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
    </div>
  );
}
