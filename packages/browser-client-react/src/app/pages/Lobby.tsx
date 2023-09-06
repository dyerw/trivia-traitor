import { ClientLobby } from '@trivia-traitor/realtime-server';
import { client } from '../../trpc';

type Props = {
  lobby: ClientLobby;
};

export default function Lobby({ lobby }: Props) {
  const startGame = async () => {
    await client.gameStart.mutate();
  };
  return (
    <div>
      <div>Lobby</div>
      <div>{lobby.code}</div>
      <div>Players:</div>
      <ul>
        {lobby.players.map((player) => (
          <li>
            {player.nickname} {player.isYou && '(you)'}{' '}
            {player.isOwner && '(owner)'}
          </li>
        ))}
      </ul>
      {(lobby.players.find((p) => p.isYou)?.isOwner ?? false) && (
        <button onClick={() => startGame()}>14 (Start)</button>
      )}
    </div>
  );
}
