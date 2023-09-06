import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import { WithSession } from './app/components/WithSession';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <WithSession>
      <WithSession>
        <App />
      </WithSession>
    </WithSession>
  </StrictMode>
);
