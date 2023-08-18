import { lazy } from 'solid-js';
import { Routes, Route } from '@solidjs/router';
import { sessionClient } from './utils/trpc';
import { sessionIdCreated } from './store';

const Home = lazy(() => import('./pages/Home'));
const Lobby = lazy(() => import('./pages/Lobby'));

function App() {
  (async () => {
    const { sessionId } = await sessionClient.sessionCreate.mutate();
    sessionIdCreated(sessionId);
  })();
  return (
    <>
      <Routes>
        <Route path="/lobby" component={Lobby} />
        <Route path="/" component={Home} />
      </Routes>
    </>
  );
}

export default App;
