import { ClientLobby, GameStartedState } from '@trivia-traitor/realtime-server';
import { client } from '../../trpc';

type Props = {
  lobby: ClientLobby & {
    game: GameStartedState;
  };
};

export default function Game({ lobby }: Props) {
  const voteForAnswer = (answerId: string) => {
    client.voteForAnswer.mutate({ answerId });
  };

  const nextQuestion = () => {
    client.nextQuestion.mutate();
  };

  return (
    <div>
      <div>Game</div>
      <div>Players</div>
      {lobby.players.map((player) => (
        <div>
          {player.nickname} {player.isYou ? '(You)' : ''}
        </div>
      ))}
      <div>
        {lobby.game.gameWinner ? (
          <div>{lobby.game.gameWinner} Won!</div>
        ) : undefined}
      </div>
      <div>
        {lobby.game.isTraitor
          ? 'You are the traitor'
          : 'You are not the traitor'}
      </div>
      <div>Votes Submitted: {lobby.game.totalVotesSubmitted}</div>
      <div>Questions Right: {lobby.game.questionsCorrect}</div>
      <div>Questions Wrong: {lobby.game.questionsWrong}</div>
      <div>{lobby.game.currentQuestionText}</div>
      {lobby.game.yourVoteAnswerId ? (
        <div>
          You answered: {lobby.game.answers[lobby.game.yourVoteAnswerId]}
        </div>
      ) : (
        <div>
          {Object.entries(lobby.game.answers).map(([id, text]) => (
            <button onClick={() => voteForAnswer(id)}>{text}</button>
          ))}
        </div>
      )}
      {lobby.game.isTraitor && (
        <>
          <div>{lobby.game.correctAnswerId}</div>
          <div>{lobby.game.explanation}</div>
        </>
      )}
      <button onClick={() => nextQuestion()}>Next Question or whatever</button>
    </div>
  );
}
