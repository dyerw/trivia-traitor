import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';

import type { AppRouter } from '@trivia-traitor/realtime-server';

console.log({ env: import.meta.env });
const host = import.meta.env.VITE_HOST ?? 'localhost';
const port = import.meta.env.VITE_PORT ?? 3000;
const isProd = import.meta.env.MODE === 'production';
const protocol = isProd ? 'wss' : 'ws';
const url = `${protocol}://${host}${isProd ? '' : `:${port}`}`;
console.log({ url });

const wsClient = createWSClient({
  url,
});

export const client = createTRPCProxyClient<AppRouter>({
  links: [
    wsLink({
      client: wsClient,
    }),
  ],
});
