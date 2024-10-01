"use client"

import AddItem from './components/AddItem';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { useCallback } from 'react';
 import { useAccount, useConnect } from 'wagmi';
import auth, {provider} from '../lib/firebase/auth'
import {TwitterAuthProvider, signInWithPopup} from 'firebase/auth'
const sdk = new CoinbaseWalletSDK({
  appName: 'My App Name',
  appChainIds: [8453]
});

export default function Home() {
    const { connectors, connect, data } = useConnect();
    const account = useAccount()



const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect]);

  const onSignInWithTwitter = () => {
signInWithPopup(auth, provider)
  .then((result) => {
    console.log("^_^ ~ file: page.tsx:32 ~ .then ~ result:", result);

    // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
    // You can use these server side with your app's credentials to access the Twitter API.
    const credential = TwitterAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const secret = credential?.secret;

          // The signed-in user info.
      const user = result.user;
      console.log('User info:', user);
      console.log('Access Token:', token);
      console.log('Secret:', secret);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    console.log("^_^ ~ file: page.tsx:45 ~ .then ~ errorCode:", errorCode);

    const errorMessage = error.message;
    console.log("^_^ ~ file: page.tsx:46 ~ .then ~ errorMessage:", errorMessage);

    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = TwitterAuthProvider.credentialFromError(error);
    // ...
  });
  }
  
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      {!account.isConnected && <button className="btn btn-neutral" onClick={createWallet}>Get Started</button>}
      <h2>Your connected account is {account.address}</h2>
      <button className='btn btn-neutral' onClick={onSignInWithTwitter}> Sign in with Twitter</button>
    </div>
  );
}