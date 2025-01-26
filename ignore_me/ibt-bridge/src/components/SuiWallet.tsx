// src/components/SuiWallet.tsx
import { useEffect, useState } from "react";
import { useWallets, useSuiClient, WalletWithRequiredFeatures } from "@mysten/dapp-kit";
import { IBT_COIN_TYPE } from "../utils/constants";

const SuiWallet = () => {
  const { getWallets, connect, disconnect } = useWallets(); // Retrieve wallet methods
  const suiClient = useSuiClient(); // Sui client instance
  const [suiBalance, setSuiBalance] = useState<number | null>(null);
  const [ibtBalance, setIbtBalance] = useState<number | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] = useState<WalletWithRequiredFeatures | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!currentWallet || !connectedAddress) {
        setSuiBalance(null);
        setIbtBalance(null);
        return;
      }

      try {
        // Fetch SUI Balance
        const suiCoins = await suiClient.getAllCoins({ owner: connectedAddress });
        const totalSuiBalance = suiCoins.data.reduce(
          (sum, coin) => sum + Number(coin.balance),
          0
        );
        setSuiBalance(totalSuiBalance / 10 ** 9); // Convert from MIST to SUI

        // Fetch IBT Balance
        const ibtCoins = await suiClient.getCoins({
          owner: connectedAddress,
          coinType: IBT_COIN_TYPE,
        });
        const totalIbtBalance = ibtCoins.data.reduce(
          (sum, coin) => sum + Number(coin.balance),
          0
        );
        setIbtBalance(totalIbtBalance / 10 ** 18); // Assuming IBT has 18 decimals
      } catch (error) {
        console.error("Error fetching balances:", error);
        setSuiBalance(null);
        setIbtBalance(null);
      }
    };

    fetchBalances();
  }, [currentWallet, connectedAddress, suiClient]);

  const handleConnect = async () => {
    const wallets = getWallets(); // Retrieve available wallets
    if (!wallets.length) {
      alert("No wallets found. Please install a Sui-compatible wallet.");
      return;
    }

    const wallet = wallets[0]; // Select the first available wallet
    try {
      const account = await connect(wallet); // Connect to the wallet
      const address = await wallet.getAddress();
      setCurrentWallet(wallet); // Set the connected wallet
      setConnectedAddress(address); // Set the connected wallet's address
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect Sui wallet. Please try again.");
    }
  };

  const handleDisconnect = async () => {
    if (currentWallet) {
      await disconnect(currentWallet);
      setCurrentWallet(null);
      setConnectedAddress(null);
      setSuiBalance(null);
      setIbtBalance(null);
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginBottom: "20px" }}>
      <h2>Sui Wallet</h2>
      {currentWallet ? (
        <div>
          <p>Connected Address: {connectedAddress || "Fetching address..."}</p>
          <div style={{ marginBottom: "10px" }}>
            <strong>SUI Balance:</strong>{" "}
            {suiBalance !== null ? `${suiBalance} SUI` : "Fetching..."}
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong>IBT Balance:</strong>{" "}
            {ibtBalance !== null ? `${ibtBalance} IBT` : "Fetching..."}
          </div>
          <button onClick={handleDisconnect}>Disconnect Sui Wallet</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Sui Wallet</button>
      )}
    </div>
  );
};

export default SuiWallet;
