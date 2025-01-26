import React from 'react';
import './App.css';
import SuiWallet1s from './components/SuiWallet/SuiWallet';
import WalletCard from './components/EthWallet/WalletCard';
import { ENV_TO_API, API_ENV } from './api-env.ts';

const currentEnv = API_ENV.local; // Change this to the desired environment
const apiEndpoint = ENV_TO_API[currentEnv];

if (apiEndpoint) {
  console.log(`Using API endpoint for ${currentEnv}: ${apiEndpoint}`);
} else {
  console.error(`No API endpoint configured for ${currentEnv}`);
}

const App: React.FC = () => {
  return (
    
    <div className="App">
      <WalletCard />
      <SuiWallet1s />
    </div>
  );
};

export default App;
