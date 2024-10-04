"use client"

import { useState, useCallback, useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { useAccount, useConnect } from 'wagmi';
import auth, { provider } from '../lib/firebase/auth';
import { TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
import db from '../lib/firebase/firestore';
import { doc, setDoc, updateDoc } from "firebase/firestore"; // Firestore imports
import { fetchTwitterUserInfoById } from '../lib/twitter/twitter';
import { httpsCallable } from 'firebase/functions';
import functions  from '../lib/firebase/functions';
import { callFetchTwitterFollowers } from './helpers/functions';


const sdk = new CoinbaseWalletSDK({
  appName: 'My App Name',
  appChainIds: [8453],
});

export default function Home() {
  const { connectors, connect } = useConnect();
  const account = useAccount();
  
  // State to check if the user is signed in with Twitter
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState<string>(); // Store the Firebase user id

  // Function to create wallet
  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect, account.address, userId]);

  // Function to handle Twitter sign-in and Firestore user creation
  const onSignInWithTwitter = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        console.log("^_^ ~ file: page.tsx:39 ~ .then ~ result:", result);

        // This gives you the Twitter OAuth 1.0 Access Token and Secret.
        const credential = TwitterAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const secret = credential?.secret;

        // The signed-in user info.
        const user = result.user;
        //@ts-ignore
        console.log("^_^ ~ file: page.tsx:48 ~ .then ~ user:", user.screenName);

        console.log("User info:", user.reloadUserInfo.screenName);
        console.log('Access Token:', token);
        console.log('Secret:', secret);

        setUserId(user.uid);

        // Create a Firestore document for the user
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          twitterId: user.providerData[0].uid,
          photoUrl: user.photoURL,
          twitterUsername: user.reloadUserInfo.screenName
        });
          console.log("^_^ ~ file: page.tsx:70 ~ .then ~ user.reloadUserInfo.screenName:", user.reloadUserInfo.screenName);
          console.log("^_^ ~ file: page.tsx:78 ~ .then ~ user.uid:", user.uid);

        await callFetchTwitterFollowers(
          user.reloadUserInfo.screenName,
          user.uid
        );

      })


    }
    // UseEffect to check and print once the account address and userId are available
  useEffect(() => {
    if (account.address && userId) {
      // Print the userId and account.address when they are available
      console.log('User ID:', userId);
      console.log('Wallet Address:', account.address);

      // Update Firestore with the wallet address (this part is just for printing)
      const userDocRef = doc(db, "users", userId);
      updateDoc(userDocRef, {
        walletAddress: account.address
      })
      .then(() => {
        console.log("Wallet address updated in Firestore");
      })
      .catch((error) => {
        console.error("Error updating wallet address:", error);
      });
    }
  }, [account.address, userId]); // Trigger useEffect when account.address or userId changes


  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <button className="btn btn-neutral" onClick={() => console.log("fetch user data")}>
        Fetch twitter user data
      </button>
      {/* Show Twitter Sign-In button if not signed in */}
      {!isSignedIn && (
        <button className="btn btn-neutral" onClick={onSignInWithTwitter}>
          Sign in with Twitter
        </button>
      )}

      {/* After sign-in, show the Create Wallet button */}
      {isSignedIn && !account.isConnected && (
        <button className="btn btn-neutral" onClick={createWallet}>
          Create Wallet
        </button>
      )}

      {/* Display connected account information */}
      {account.isConnected && isSignedIn && (
        <h2>Your connected account is {account.address}</h2>
      )}
    </div>
  );
}