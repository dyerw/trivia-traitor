import { JSX, splitProps } from 'solid-js';

type TextInputProps = {
  name: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date' | 'number';
  label?: string;
  placeholder?: string;
  value: string | number | undefined;
  error: string;
  required?: boolean;
  ref: (element: HTMLInputElement) => void;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
};

export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, ['value', 'label', 'error']);
  return (
    <div>
      {props.label && (
        <label for={props.name}>
          {props.label} {props.required && <span>*</span>}
        </label>
      )}
      <input
        {...inputProps}
        id={props.name}
        value={props.value || ''}
        aria-invalid={!!props.error}
        aria-errormessage={`${props.name}-error`}
      />
      {props.error && <div id={`${props.name}-error`}>{props.error}</div>}
    </div>
  );
}

export default TextInput;
