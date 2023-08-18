import {
  createTRPCProxyClient,
  createWSClient,
  httpLink,
  wsLink,
} from '@trpc/client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from '@trivia-traitor/realtime-server';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { SessionRouter } from '@trivia-traitor/realtime-server';

const wsClient = createWSClient({
  url: `ws://localhost:3001`,
});

export const sessionClient = createTRPCProxyClient<SessionRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3002',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
export const client = createTRPCProxyClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});
