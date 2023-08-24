import { SubmitHandler, createForm, required } from '@modular-forms/solid';

import TextInput from './TextInput';

export type JoinLobbyFormInput = {
  nickname: string;
  code: string;
};

type Props = {
  onSubmit: (form: JoinLobbyFormInput) => void;
};

function JoinLobbyForm({ onSubmit }: Props) {
  const [, { Form, Field }] = createForm<JoinLobbyFormInput>();

  const handleSubmit: SubmitHandler<JoinLobbyFormInput> = (values) => {
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
      <Field name="code" validate={[required('Please enter a lobby code.')]}>
        {(field, props) => (
          <TextInput
            type="text"
            {...props}
            label="Lobby Code"
            value={field.value}
            error={field.error}
          />
        )}
      </Field>
      <button type="submit">Join Lobby</button>
    </Form>
  );
}

export default JoinLobbyForm;
