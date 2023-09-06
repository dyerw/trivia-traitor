import { client } from '../../trpc';
import { PropsWithChildren, useState, useEffect } from 'react';

/**
 * WithSession component will only render its children once it has established a session
 * with the websocket server
 */
export function WithSession({ children }: PropsWithChildren) {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const existingSid = localStorage.getItem('sid');
    client.registerSession.mutate({ sid: existingSid }).then((sid) => {
      localStorage.setItem('sid', sid);
      setRegistered(true);
    });
  });

  return registered ? children : undefined;
}
