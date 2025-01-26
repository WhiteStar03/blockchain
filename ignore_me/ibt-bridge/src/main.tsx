// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "ETH Wallet Connector",
          url: window.location.href,
        },
        // No 'rpcUrl' property here
      }}
    >
      <App />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />
    </MetaMaskProvider>
  </React.StrictMode>
);
