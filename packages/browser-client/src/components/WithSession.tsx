import { ParentProps, createSignal, Show, onMount } from 'solid-js';
import { client } from '../utils/trpc';

/**
 * WithSession component will only render its children once it has established a session
 * with the websocket server
 */
export function WithSession({ children }: ParentProps) {
  const [registered, setRegistered] = createSignal(false);

  onMount(async () => {
    const existingSid = localStorage.getItem('sid');
    const sid = await client.registerSession.mutate({ sid: existingSid });
    localStorage.setItem('sid', sid);
    setRegistered(true);
  });

  return <Show when={registered()}>{children}</Show>;
}
