import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';

import './index.css';
import App from './App';
import { WithSession } from './components/WithSession';

const root = document.getElementById('root');
if (root) {
  render(
    () => (
      <WithSession>
        <Router>
          <App />
        </Router>
      </WithSession>
    ),
    root
  );
}
