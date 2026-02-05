
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Removendo StrictMode para garantir compatibilidade máxima com bibliotecas de DND que
// gerenciam estados globais e referências de DOM de forma complexa.
root.render(<App />);
