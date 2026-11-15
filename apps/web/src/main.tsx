import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../phone/src/index.css';
import { WebApp } from './WebApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebApp defaultViewMode="app" />
  </StrictMode>
);
