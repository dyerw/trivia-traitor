import { Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { state } from '../store';

export default function Game() {
  return (
    <div>
      <Show when={state.lobby === undefined}>
        <Navigate href={'/'} />
      </Show>
      <Show
        when={
          state.lobby !== undefined && state.lobby.game.isStarted
            ? { game: state.lobby.game, players: state.lobby.players }
            : undefined
        }
      >
        {(gameState) => (
          <>
            <div>Game</div>
            <div>Players</div>
            {gameState().players.map((player) => (
              <div>
                {player.nickname} {player.isYou ? '(You)' : ''}
              </div>
            ))}
            <div>
              {gameState().game.youAreTraitor
                ? 'You are the traitor'
                : 'You are not the traitor'}
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
