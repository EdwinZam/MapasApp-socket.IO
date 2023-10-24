import React from 'react';
import ReactDOM from 'react-dom/client';
import { MapasApp } from './MapasApp';
import './index.css'
;
import { SocketProvider } from './context/SocketContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketProvider>
      <MapasApp />
    </SocketProvider>
  </React.StrictMode>
);


