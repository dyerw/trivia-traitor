import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from '@trivia-traitor/realtime-server';

console.log({ env: import.meta.env });
const host = import.meta.env.VITE_HOST ?? 'localhost';
console.log({ host });

const wsClient = createWSClient({
  url: `ws://${host}:3001`,
});

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});
