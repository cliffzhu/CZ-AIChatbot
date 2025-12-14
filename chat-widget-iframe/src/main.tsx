import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

let config: any = null;

window.addEventListener('message', (event) => {
  if (event.data.type === 'init') {
    config = event.data.config;
    // Send ready message
    (event.source as Window)?.postMessage({ type: 'ready' }, event.origin);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App config={config} />
  </StrictMode>,
)
