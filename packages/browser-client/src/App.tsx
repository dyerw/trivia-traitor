import { lazy } from 'solid-js';
import { Routes, Route } from '@solidjs/router';

const Home = lazy(() => import('./pages/Home'));
const Lobby = lazy(() => import('./pages/Lobby'));
const Game = lazy(() => import('./pages/Game'));

function App() {
  return (
    <>
      <Routes>
        <Route path="/lobby" component={Lobby} />
        <Route path="/game" component={Game} />
        <Route path="/" component={Home} />
      </Routes>
    </>
  );
}

export default App;
