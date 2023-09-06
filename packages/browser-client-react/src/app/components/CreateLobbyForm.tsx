import { GameOptions } from '@trivia-traitor/realtime-server';
import { useForm } from 'react-hook-form';

export type CreateLobbyFormInput = {
  nickname: string;
  gameOptions: GameOptions;
};

type Props = {
  onSubmit: (form: CreateLobbyFormInput) => void;
};

function CreateLobbyForm({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<CreateLobbyFormInput>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        defaultValue="Enter Nickname"
        {...register('nickname', { required: true })}
      />
      <input
        defaultValue="Enter # rounds for traitor win"
        type="number"
        {...register('gameOptions.traitorRoundsRequired', {
          required: true,
          valueAsNumber: true,
        })}
      />
      <input
        defaultValue="Enter # rounds for team win"
        type="number"
        {...register('gameOptions.nonTraitorRoundsRequired', {
          required: true,
          valueAsNumber: true,
        })}
      />
      <button type="submit">Create Lobby</button>
    </form>
  );
}

export default CreateLobbyForm;
