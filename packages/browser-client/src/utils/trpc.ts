import {
  createTRPCProxyClient,
  createWSClient,
  httpLink,
  wsLink,
} from '@trpc/client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from '@trivia-traitor/realtime-server';
import { SessionRouter } from '@trivia-traitor/realtime-server';

const wsClient = createWSClient({
  url: `ws://localhost:3001`,
});

export const sessionClient = createTRPCProxyClient<SessionRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3002',
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
