import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';

import './index.css';
import App from './App';

const root = document.getElementById('root');
if (root) {
  render(
    () => (
      <Router>
        <App />
      </Router>
    ),
    root
  );
}
