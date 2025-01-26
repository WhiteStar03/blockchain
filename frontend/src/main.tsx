// main.tsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SuiClientProvider } from "@mysten/dapp-kit";
import { WalletProvider } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

import { networkConfig } from './networkConfig'; // <--- Your config

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <SuiClientProvider
  networkConfig={networkConfig}
  defaultNetwork="localnet"
>
  <WalletProvider>
    <App />
  </WalletProvider>
</SuiClientProvider>

  </StrictMode>
);
