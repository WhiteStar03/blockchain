// src/networkConfig.ts
import { createNetworkConfig } from "@mysten/dapp-kit";

export const { 
  networkConfig,
  useNetworkVariable,
  useNetworkVariables,
} = createNetworkConfig({
  localnet: {
    chainId: "sui:localnet", // <--- IMPORTANT!
    url: "http://localhost:9000", // Your local node's RPC
    variables: {
      counterPackageId: "0x0c1a6c5aaf1a7fcb3e5ed3bdec8a6804a9688c42c53886e84c23daeabeb6e39a",
      // ... other package IDs or variables
    },
  },
  // Optionally define testnet/mainnet too:
  testnet: {
    chainId: "sui:testnet",
    url: "https://fullnode.testnet.sui.io",
    variables: { /* ... */ },
  },
  mainnet: {
    chainId: "sui:mainnet",
    url: "https://fullnode.mainnet.sui.io",
    variables: { /* ... */ },
  },
});
