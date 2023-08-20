import { Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { state } from '../store';

export default function Game() {
  const voteForAnswer = (id: string) => {
    console.log('voting for ', id);
  };

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
              {gameState().game.isTraitor
                ? 'You are the traitor'
                : 'You are not the traitor'}
            </div>
            <div>{gameState().game.currentQuestionText}</div>
            <div>
              {Object.entries(gameState().game.answers).map(([id, text]) => (
                <button onClick={() => voteForAnswer(id)}>{text}</button>
              ))}
            </div>
            <Show
              when={(() => {
                const _gameState = gameState();
                if (_gameState.game.isTraitor) {
                  return _gameState.game;
                } else {
                  return false;
                }
              })()}
            >
              {(traitorGameState) => (
                <>
                  <div>{traitorGameState().correctAnswerId}</div>
                  <div>{traitorGameState().explanation}</div>
                </>
              )}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
