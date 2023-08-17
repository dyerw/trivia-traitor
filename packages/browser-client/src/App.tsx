import { lazy } from 'solid-js';
import { Routes, Route } from '@solidjs/router';

const Home = lazy(() => import('./pages/Home'));
const Lobby = lazy(() => import('./pages/Lobby'));

function App() {
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
