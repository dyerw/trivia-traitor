import { useForm } from 'react-hook-form';

export type JoinLobbyFormInput = {
  nickname: string;
  code: string;
  foo: {
    bar: string;
  };
};

type Props = {
  onSubmit: (form: JoinLobbyFormInput) => void;
};

function JoinLobbyForm({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<JoinLobbyFormInput>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        defaultValue="Enter Nickname"
        {...register('nickname', { required: true })}
      />
      <input
        defaultValue="Enter Lobby Code"
        {...register('code', { required: true })}
      />
      <button type="submit">Join Lobby</button>
    </form>
  );
}

export default JoinLobbyForm;
