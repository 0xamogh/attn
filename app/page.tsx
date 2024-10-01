"use client"

import AddItem from './components/AddItem';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { useCallback } from 'react';
 import { useConnect } from 'wagmi';

const sdk = new CoinbaseWalletSDK({
  appName: 'My App Name',
  appChainIds: [8453]
});

export default function Home() {
    const { connectors, connect, data } = useConnect();
const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect]);
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <button className="btn btn-neutral" onClick={createWallet}>Login</button>
    </div>
  );
}