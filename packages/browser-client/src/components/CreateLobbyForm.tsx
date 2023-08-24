// eslint-disable-next-line @nx/enforce-module-boundaries
import { GameOptions } from '@trivia-traitor/realtime-server';
import { SubmitHandler, createForm, required } from '@modular-forms/solid';

import TextInput from './TextInput';

export type CreateLobbyFormInput = {
  nickname: string;
  gameOptions: GameOptions;
};

type Props = {
  onSubmit: (form: CreateLobbyFormInput) => void;
};

function CreateLobbyForm({ onSubmit }: Props) {
  const [, { Form, Field }] = createForm<CreateLobbyFormInput>();

  const handleSubmit: SubmitHandler<CreateLobbyFormInput> = (values) => {
    onSubmit(values);
  };
  return (
    <Form onSubmit={handleSubmit}>
      <Field name="nickname" validate={[required('Please enter a nickname.')]}>
        {(field, props) => (
          <TextInput
            type="text"
            {...props}
            label="Nickname"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Field
        validate={[
          required('Please enter number of rounds for traitor to win.'),
        ]}
        name="gameOptions.traitorRoundsRequired"
        type="number"
      >
        {(field, props) => (
          <TextInput
            {...props}
            type="number"
            label="Traitor Rounds to Win"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <Field
        validate={[
          required('Please enter number of rounds for traitor to win.'),
        ]}
        name="gameOptions.nonTraitorRoundsRequired"
        type="number"
      >
        {(field, props) => (
          <TextInput
            {...props}
            type="number"
            label="Team Rounds to Win"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <button type="submit">Create Lobby</button>
    </Form>
  );
}

export default CreateLobbyForm;
