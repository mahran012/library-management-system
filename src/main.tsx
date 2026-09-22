import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { LibraryProvider } from './context/LibraryContext';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <LibraryProvider>
      <App />
    </LibraryProvider>
  </StrictMode>,
);
