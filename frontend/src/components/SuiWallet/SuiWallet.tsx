import React, { useState, useEffect } from "react";
import { ConnectButton, useWallet, addressEllipsis } from "@suiet/wallet-kit";
import { useSuiClient, useSuiClientContext } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const SuiWalletToken = () => {
  const wallet = useWallet();
  console.log(wallet)


  const client = useSuiClient(); // Access the Sui client
  const suiContext = useSuiClientContext(); // Access network context
  const [ibtBalance, setIbtBalance] = useState<string>("0");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [burnAmount, setBurnAmount] = useState<string>("");
  const [burnStatus, setBurnStatus] = useState<string>("");
  const [ownerCapId] = useState<string>("0x63c5c354504701c941607ffbfd886948f0c0f80991c011a23a1b17643f4f1f4e");
  const [treasuryCapId] = useState<string>("0x757f3e574bc7b2589b20057764a740e6d619bcb5f5306b670d196c7a85f4399f");

  const ibtCoinType = "0x0c1a6c5aaf1a7fcb3e5ed3bdec8a6804a9688c42c53886e84c23daeabeb6e39a::IBT::IBT";

  // Utility to serialize burn amount (number -> u64)
  const serializeNumber = (num: bigint): Uint8Array => {
    const buffer = new ArrayBuffer(8); // 8 bytes for u64
    const view = new DataView(buffer);
    view.setBigUint64(0, num, true); // Little-endian encoding
    return new Uint8Array(buffer);
  };

  // Utility to encode string (e.g., address) into Uint8Array
  const encodeString = (str: string): Uint8Array => new TextEncoder().encode(str);

  // Fetch IBT balance
  const fetchIBTBalance = async () => {
    if (!wallet.connected || !wallet.account?.address) return;

    try {
      setWalletAddress(wallet.account.address);

      // Fetch IBT coins owned by the wallet
      const coins = await client.getCoins({
        owner: wallet.account.address,
        coinType: ibtCoinType,
      });

      // Calculate the total IBT balance
      const totalBalance = coins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      );

      setIbtBalance((totalBalance / BigInt(10 ** 18)).toString()); // Assuming 18 decimals for IBT
    } catch (error) {
      console.error("Error fetching IBT balance:", error);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchIBTBalance();
    }
  }, [wallet.connected]);
  // Create Burn Transaction
  const createBurnTxn = async (): Promise<Transaction> => {
    if (!wallet.account?.address) {
      throw new Error("Wallet is not connected or account address is missing.");
    }

    // Fetch coins of IBT type
    const coins = await client.getCoins({
      owner: wallet.account.address,
      coinType: ibtCoinType,
    });

    if (!coins.data || coins.data.length === 0) {
      throw new Error("No IBT coins found in the wallet.");
    }

    const burnAmountValue = BigInt(burnAmount) * BigInt(10 ** 18); // Convert burn amount to raw value
    const selectedCoin = coins.data.find((coin) => BigInt(coin.balance) >= burnAmountValue);

    if (!selectedCoin) {
      throw new Error("No IBT coin with sufficient balance found for the burn amount.");
    }

    const txn = new Transaction();

    txn.moveCall({
      target: `${ibtCoinType.split("::")[0]}::IBT::bridge_burn`,
      arguments: [
        txn.object(ownerCapId), // OwnerCap object ID
        txn.object(treasuryCapId), // TreasuryCap object ID
        txn.pure(encodeString(wallet.account.address)), // Encode address
        txn.pure(serializeNumber(burnAmountValue)), // Serialize burn amount as u64
        txn.object(selectedCoin.coinObjectId), // Coin object ID
      ],
    });

    return txn;
  };

  // Burn IBT tokens
  const burnIbt = async () => {
    if (!wallet.connected) {
      alert("Please connect your wallet first.");
      return;
    }
    setBurnStatus("Submitting burn transaction...");

    try {
      const txn = await createBurnTxn();
      const res = await wallet.signAndExecuteTransaction({
        transaction: txn,
      });
      console.log("Burn transaction response:", res);
      setBurnStatus("Burn successful!");
      fetchIBTBalance(); // Refresh balance after burning
    } catch (error) {
      console.error("Burn transaction failed:", error);
      setBurnStatus("Burn failed.");
    }
  };

  const NetworkSelector = () => {
    return (
      <div>
        <h2>Select Network</h2>
        {Object.keys(suiContext.networks).map((network) => (
          <button
            key={network}
            onClick={() => suiContext.selectNetwork(network)}
            style={{
              padding: "8px",
              margin: "4px",
              backgroundColor: suiContext.network === network ? "green" : "gray",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {`Switch to ${network}`}
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h1>Sui Wallet: IBT Token Management</h1>
      <ConnectButton />
      <NetworkSelector />
      {wallet.connected ? (
        <>
          <p>Wallet Address: {addressEllipsis(walletAddress)}</p>
          <p>Total IBT Balance: {ibtBalance} IBT</p>
          <input
            type="number"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder="Amount to burn"
          />
          <button onClick={burnIbt}>Burn IBT</button>
          <p>{burnStatus}</p>
        </>
      ) : (
        <p>Please connect your wallet to manage IBT tokens.</p>
      )}
    </div>
  );
};

export default SuiWalletToken;
