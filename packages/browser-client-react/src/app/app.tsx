import { isStarted } from '../util/lobby-util';
import { useLobby } from './hooks/use-lobby';
import Game from './pages/Game';
import Home from './pages/Home';
import Lobby from './pages/Lobby';

export function App() {
  const { lobby } = useLobby();
  if (lobby === undefined) {
    return <Home />;
  }
  if (isStarted(lobby)) {
    return <Game lobby={lobby} />;
  }
  return <Lobby lobby={lobby} />;
}

export default App;
