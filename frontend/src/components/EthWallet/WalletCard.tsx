// src/WalletCard.tsx
import React, { useState, useEffect } from 'react';
import { ethers, Contract, providers } from 'ethers';
import './WalletCard.css';

// Define the structure of the mint and burn status
interface Status {
  type: 'error' | 'info' | 'success';
  message: string;
}

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      isMetaMask?: boolean;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}

const WalletCard: React.FC = () => {
  // State variables
  const [errorMessage, setErrorMessage] = useState<string | JSX.Element | null>(null);
  const [defaultAccount, setDefaultAccount] = useState<string | null>(null);
  {/* const [userETHBalance, setUserETHBalance] = useState<string | null>(null); */}
  const [userIBTBalance, setUserIBTBalance] = useState<string | null>(null);
  const [connButtonText, setConnButtonText] = useState<string>('Connect Wallet');
  const [isOwner, setIsOwner] = useState<boolean>(false); // New state to check ownership

  // Minting state variables
  const [mintAddress, setMintAddress] = useState<string>('');
  const [mintAmount, setMintAmount] = useState<string>('');
  const [mintStatus, setMintStatus] = useState<Status | null>(null);

  // Burning state variables
  const [burnAmount, setBurnAmount] = useState<string>('');
  const [burnDestinationChain, setBurnDestinationChain] = useState<string>('');
  const [burnStatus, setBurnStatus] = useState<Status | null>(null);

  // IBT Token Contract Details
  const ibtTokenAddress: string = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Your IBT Token Contract Address

  // Minimal ABI to interact with IBT Token Contract (including owner and mint functions)
  const ibtTokenABI: any[] = [
    // balanceOf
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function',
    },
    // decimals
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      type: 'function',
    },
    // name
    {
      constant: true,
      inputs: [],
      name: 'name',
      outputs: [{ name: '', type: 'string' }],
      type: 'function',
    },
    // symbol
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      type: 'function',
    },
    // owner
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [{ name: '', type: 'address' }],
      type: 'function',
    },
    // mint
    {
      constant: false,
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'mint',
      outputs: [],
      type: 'function',
    },
    // burn
    {
      constant: false,
      inputs: [
        { name: 'amount', type: 'uint256' },
        { name: 'destinationChain', type: 'string' },
      ],
      name: 'burn',
      outputs: [],
      type: 'function',
    },
    // burnFrom
    {
      constant: false,
      inputs: [
        { name: 'from', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'destinationChain', type: 'string' },
      ],
      name: 'burnFrom',
      outputs: [],
      type: 'function',
    },
    // transfer
    {
      constant: false,
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ name: '', type: 'bool' }],
      type: 'function',
    },
  ];

  // Function to connect to MetaMask wallet
  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('MetaMask is installed!');

      try {
        const accounts: string[] = await window.ethereum.request!({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          accountChangedHandler(accounts[0]);
          setConnButtonText('Wallet Connected');
        }
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    } else {
      console.log('MetaMask is not installed');
      setErrorMessage(
        <span>
          MetaMask is not installed. Please install it from{' '}
          <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer">
            here
          </a>.
        </span>
      );
    }
  };

  // Handler for account changes
  const accountChangedHandler = async (newAccount: string) => {
    setDefaultAccount(newAccount);
    //await getAccountETHBalance(newAccount);
    await getIBTBalance(newAccount);
    await checkIfOwner(newAccount);
  };

  {/*
  // Function to get ETH balance
  const getAccountETHBalance = async (account: string) => {
    try {
      const balance: string = await window.ethereum!.request!({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      setUserETHBalance(ethers.utils.formatEther(balance));
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };
*/}
  // Function to get IBT Token balance
  const getIBTBalance = async (account: string) => {
    try {
      const provider: providers.Web3Provider = new ethers.providers.Web3Provider(window.ethereum!);
      const contract: Contract = new ethers.Contract(ibtTokenAddress, ibtTokenABI, provider);
      const balance: ethers.BigNumber = await contract.balanceOf(account);
      const decimals: number = await contract.decimals();
      const formattedBalance: string = ethers.utils.formatUnits(balance, decimals);
      setUserIBTBalance(formattedBalance);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  // Function to check if the connected account is the owner
  const checkIfOwner = async (account: string) => {
    try {
      const provider: providers.Web3Provider = new ethers.providers.Web3Provider(window.ethereum!);
      const contract: Contract = new ethers.Contract(ibtTokenAddress, ibtTokenABI, provider);
      const contractOwner: string = await contract.owner();

      console.log('Connected Account:', account);
      console.log('Contract Owner:', contractOwner);

      if (account.toLowerCase() === contractOwner.toLowerCase()) {
        setIsOwner(true);
        console.log('User is the contract owner.');
      } else {
        setIsOwner(false);
        console.log('User is NOT the contract owner.');
      }
    } catch (error: any) {
      console.error('Error checking owner:', error);
      setErrorMessage(error.message);
    }
  };

  // Handler for chain/network changes
  const chainChangedHandler = () => {
    // Reload the page to avoid any errors with chain change mid-use of application
    window.location.reload();
  };

  // Function to handle minting
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mintAddress || !mintAmount) {
      setMintStatus({ type: 'error', message: 'Please provide both address and amount.' });
      return;
    }

    if (!ethers.utils.isAddress(mintAddress)) {
      setMintStatus({ type: 'error', message: 'Invalid Ethereum address.' });
      return;
    }

    try {
      const provider: providers.Web3Provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer: ethers.Signer = provider.getSigner();
      const contract: Contract = new ethers.Contract(ibtTokenAddress, ibtTokenABI, signer);

      const decimals: number = await contract.decimals();
      const amountInWei: ethers.BigNumber = ethers.utils.parseUnits(mintAmount, decimals);

      const txn: ethers.ContractTransaction = await contract.mint(mintAddress, amountInWei);
      setMintStatus({ type: 'info', message: 'Transaction submitted. Waiting for confirmation...' });

      await txn.wait();
      setMintStatus({ type: 'success', message: 'Mint successful!' });

      // Refresh IBT balance
      if (defaultAccount) {
        await getIBTBalance(defaultAccount);
      }
    } catch (error: any) {
      console.error(error);
      setMintStatus({ type: 'error', message: error.message });
    }
  };

  // Function to handle burning
  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!burnAmount || !burnDestinationChain) {
      setBurnStatus({ type: 'error', message: 'Please provide both amount and destination chain.' });
      return;
    }

    if (parseFloat(burnAmount) <= 0) {
      setBurnStatus({ type: 'error', message: 'Burn amount must be greater than zero.' });
      return;
    }

    try {
      const provider: providers.Web3Provider = new ethers.providers.Web3Provider(window.ethereum!);
      const signer: ethers.Signer = provider.getSigner();
      const contract: Contract = new ethers.Contract(ibtTokenAddress, ibtTokenABI, signer);

      const decimals: number = await contract.decimals();
      const amountInWei: ethers.BigNumber = ethers.utils.parseUnits(burnAmount, decimals);

      const txn: ethers.ContractTransaction = await contract.burn(amountInWei, burnDestinationChain);
      setBurnStatus({ type: 'info', message: 'Transaction submitted. Waiting for confirmation...' });

      await txn.wait();
      setBurnStatus({ type: 'success', message: 'Burn successful!' });

      // Refresh IBT balance
      if (defaultAccount) {
        await getIBTBalance(defaultAccount);
      }
    } catch (error: any) {
      console.error(error);
      setBurnStatus({ type: 'error', message: error.message });
    }
  };

  // Setup event listeners on component mount
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          accountChangedHandler(accounts[0]);
        } else {
          // Handle the case where all accounts are disconnected
          setDefaultAccount(null);
          //setUserETHBalance(null);
          setUserIBTBalance(null);
          setIsOwner(false);
          setConnButtonText('Connect Wallet');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', chainChangedHandler);

      // Cleanup listeners on component unmount
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', chainChangedHandler);
      };
    }
  }, []);

  return (
    <div className='walletCard'>
      <h4>Connect to MetaMask to View Your Balances</h4>
      <button onClick={connectWalletHandler}>{connButtonText}</button>
      {defaultAccount && (
        <div className='accountDisplay'>
          <h3>Address: {defaultAccount}</h3>
        </div>
      )}
      {/* 
      {userETHBalance && (
        <div className='balanceDisplay'>
          <h3>ETH Balance: {userETHBalance} ETH</h3>
        </div>
      )}
        */}
      {userIBTBalance && (
        <div className='balanceDisplay'>
          <h3>IBT Balance: {userIBTBalance} IBT</h3>
        </div>
      )}
      {defaultAccount && (
        <div className='ownershipStatus'>
          {isOwner ? (
            <p style={{ color: 'green' }}>You are the contract owner.</p>
          ) : (
            <p style={{ color: 'red' }}>You are not the contract owner.</p>
          )}
        </div>
      )}
      {isOwner && (
        <div className='mintSection'>
          <h4>Mint IBT Tokens</h4>
          <form onSubmit={handleMint}>
            <div>
              <label>Recipient Address:</label>
              <input
                type='text'
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                placeholder='0x...'
                required
              />
            </div>
            <div>
              <label>Amount:</label>
              <input
                type='number'
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder='Amount to mint'
                min='0'
                step='any'
                required
              />
            </div>
            <button type='submit'>Mint Tokens</button>
          </form>
          {mintStatus && (
            <p className={`mintStatus ${mintStatus.type}`}>
              {mintStatus.message}
            </p>
          )}
        </div>
      )}
      {/* Burn Section for All Users */}
      {defaultAccount && (
        <div className='burnSection'>
          <h4>Burn IBT Tokens</h4>
          <form onSubmit={handleBurn}>
            <div>
              <label>Amount:</label>
              <input
                type='number'
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder='Amount to burn'
                min='0'
                step='any'
                required
              />
            </div>
            <div>
              <label>Destination Chain:</label>
              <input
                type='text'
                value={burnDestinationChain}
                onChange={(e) => setBurnDestinationChain(e.target.value)}
                placeholder='Destination Chain'
                required
              />
            </div>
            <button type='submit'>Burn Tokens</button>
          </form>
          {burnStatus && (
            <p className={`burnStatus ${burnStatus.type}`}>
              {burnStatus.message}
            </p>
          )}
        </div>
      )}
      {errorMessage && <p className='error'>Error: {errorMessage}</p>}
    </div>
  );
};

export default WalletCard;
