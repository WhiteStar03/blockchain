// src/components/EthereumWallet.tsx
import React, { useState } from "react";
import { useSDK } from "@metamask/sdk-react";

const EthereumWallet = () => {
  const [account, setAccount] = useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts?.[0]);
    } catch (err) {
      console.warn("Failed to connect to Ethereum wallet:", err);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <h2>Ethereum Wallet</h2>
      <button style={{ padding: 10, margin: 10 }} onClick={connect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect MetaMask"}
      </button>
      {connected && (
        <div>
          <>
            {chainId && <p>Connected chain: {chainId}</p>}
            {account && <p>Connected account: {account}</p>}
          </>
        </div>
      )}
    </div>
  );
};

export default EthereumWallet;
