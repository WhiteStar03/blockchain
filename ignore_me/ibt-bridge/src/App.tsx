// src/App.tsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const App = () => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  // Function to connect to MetaMask
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const tempProvider = new ethers.providers.Web3Provider(ethereum);
        setProvider(tempProvider);
        toast.success('Connected to MetaMask successfully!');
      } catch (error) {
        console.error('Connection error:', error);
        toast.error('Failed to connect to MetaMask.');
      }
    } else {
      toast.error('MetaMask is not installed.');
    }
  };

  // Function to fetch ETH balance
  const fetchBalance = async () => {
    if (!provider || !account) {
      setBalance('');
      return;
    }

    try {
      const balanceBigInt = await provider.getBalance(account);
      const balanceInEth = ethers.utils.formatEther(balanceBigInt);
      setBalance(parseFloat(balanceInEth).toFixed(4)); // Display up to 4 decimal places
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance.');
    }
  };

  // Fetch balance when account or provider changes
  useEffect(() => {
    if (provider && account) {
      fetchBalance();
    }
  }, [provider, account]);

  // Listen for account or network changes
  useEffect(() => {
    if ((window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has not connected any accounts
          setAccount('');
          setBalance('');
          toast.info('Disconnected from MetaMask.');
        } else {
          setAccount(accounts[0]);
          fetchBalance();
          toast.info('Account changed.');
        }
      };

      const handleChainChanged = (chainId: string) => {
        window.location.reload();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [provider]);

  return (
    <div style={styles.container}>
      <h1>ETH Wallet Connector</h1>
      {!account ? (
        <button onClick={connectWallet} style={styles.button}>
          Connect MetaMask
        </button>
      ) : (
        <div style={styles.infoContainer}>
          <p>
            <strong>Account:</strong> {account}
          </p>
          <p>
            <strong>Balance:</strong> {balance} ETH
          </p>
          <p>
            <strong>Network:</strong> {provider?.network?.chainId}
          </p>
        </div>
      )}
    </div>
  );
};

// Simple inline styles for basic styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  infoContainer: {
    marginTop: '20px',
    textAlign: 'center' as 'center',
  },
};

export default App;
