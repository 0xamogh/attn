"use client"

import { useState, useCallback, useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { useAccount, useConnect } from 'wagmi';
import auth, { provider } from '../lib/firebase/auth';
import { TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
import db from '../lib/firebase/firestore';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Firestore imports
import { httpsCallable } from 'firebase/functions';
import functions  from '../lib/firebase/functions';
import { callFetchTwitterFollowers } from './helpers/functions';
import {open, playfair} from "../lib/font/font"
import Link from 'next/link';
import { useAuth } from './context/authContext';

export default function Home() {
  const { connectors, connect } = useConnect();
  const account = useAccount();

  // State to check if the user is signed in with Twitter
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState<string>(); // Store the Firebase user id
  const [twitterUsername, setTwitterUsername] = useState<string>();
  const [toastVisible, setToastVisible] = useState(false);
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(); // State to store user data
  const [rangeValue, setRangeValue] = useState(0.1); // Default value set to 50 (you can set this to any number within the range)
  const [telegramId, setTelegramId] = useState<string>()
  const [toastUpdateProfile, setToastUpdateProfile] =useState(false)

  const handleCopy = () => {
    console.log("^_^ ~ file: page.tsx:34 ~ handleCopy ~ twitterUsername:", twitterUsername);
    const profileUrl = window.location.origin + "/profile/" + twitterUsername; // Your specific URL to be copied

    navigator.clipboard.writeText(profileUrl).then(() => {
      setToastVisible(true); // Show the toast
      setTimeout(() => setToastVisible(false), 3000); // Hide the toast after 3 seconds
    });
  };

    // const handleUpdate = () => {
    //   const profileUrl = window.location.origin + "/profile/" + twitterUsername; // Your specific URL to be copied
    //   navigator.clipboard.writeText(profileUrl).then(() => {
    //     setToastVisible(true); // Show the toast
    //     setTimeout(() => setToastVisible(false), 3000); // Hide the toast after 3 seconds
    //   });
    // };

  // Function to create wallet
  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK"
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect, account.address, userId]);

  // Function to handle Twitter sign-in and Firestore user creation
  const onSignInWithTwitter = () => {
    signInWithPopup(auth, provider).then(async (result) => {
      console.log("^_^ ~ file: page.tsx:39 ~ .then ~ result:", result);

      // The signed-in user info.
      const user = result.user;
      //@ts-ignore
      console.log("^_^ ~ file: page.tsx:48 ~ .then ~ user:", user.screenName);

      //@ts-ignore
      const twitterUsername = user.reloadUserInfo.screenName;
s

      setUserId(user.uid);
      setIsSignedIn(true);
      setTwitterUsername(twitterUsername);

      // Create a Firestore document for the user
      const userDocRef = doc(db, "users", user.uid);
      setDoc(
        userDocRef,
        {
          name: user.displayName,
          email: user.email,
          twitterId: user.providerData[0].uid,
          photoUrl: user.photoURL,
          twitterUsername: twitterUsername,
        },
        {
          merge: true,
        }
      );
    });
  };

  useEffect(() => {
    const fetchUserFromDB = async (uid: string) => {
      try {
        // Query the user document from Firestore using the user's UID
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // Store the fetched user data in state
          setUserData(userDoc.data());
          const twitterId = userDoc.data().twitterUsername;
          setTwitterUsername(twitterId)
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    if (user) {
      setIsSignedIn(true); // Update sign-in state

      // Fetch the full user document from Firestore
      console.log("^_^ ~ file: page.tsx:118 ~ useEffect ~ user.uid:", user.uid);
      fetchUserFromDB(user.uid);
    }

  }, [account, user]);

  // UseEffect to check and print once the account address and userId are available
  useEffect(() => {
    if (account.address && userId) {
      // Print the userId and account.address when they are available
      console.log("User ID:", userId);
      console.log("Wallet Address:", account.address);

      // Update Firestore with the wallet address (this part is just for printing)
      const userDocRef = doc(db, "users", userId);
      updateDoc(userDocRef, {
        walletAddress: account.address,
      })
        .then(() => {
          console.log("Wallet address updated in Firestore");
        })
        .catch((error) => {
          console.error("Error updating wallet address:", error);
        });
    }
  }, [account.address, userId]); // Trigger useEffect when account.address or userId changes

    const handleRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setRangeValue(event.target.valueAsNumber); // Update state with the value of the range input
    };

     const handleTelegramIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       setTelegramId(event.target.value); // Update state with the value of the range input
     };
     const handleUpdateProfile = async () => {
       if (user && user.uid) {
         try {
           // Get a reference to the user's document
           const userDocRef = doc(db, "users", user.uid);

           // Update the user's profile with the new rangeValue and telegramId
           await updateDoc(userDocRef, {
             price: rangeValue,
             telegramID: telegramId,
           });
  setToastUpdateProfile(true); // Show the toast
  setTimeout(() => setToastUpdateProfile(false), 3000); // Hide the toast after 3 seconds
           console.log("Profile updated successfully");
         } catch (error) {
           console.error("Error updating profile: ", error);
         }
       }
     };

  return (
    <>
      <div className="hero bg-cream min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className={" text-black text-6xl " + playfair.className}>
              {"👋🏻 \n welcome to"} <span className="italic">attn.</span>
            </h1>
            <p className={"py-6 text-black " + open.className}>
              reach out to someone you can't.
            </p>
            {!isSignedIn && (
              <button
                className={
                  "my-6 btn btn-md rounded-full btn-primary shadow-xl text-white " +
                  open.className
                }
                onClick={onSignInWithTwitter}
              >
                Get Started
              </button>
            )}
            {/* After sign-in, show the Create Wallet button */}
            {isSignedIn && !account.isConnected && (
              <button
                className={
                  "my-6 btn btn-md rounded-full btn-neutral shadow-xl text-white " +
                  open.className
                }
                onClick={createWallet}
              >
                Connect Smart Wallet
              </button>
            )}

            {isSignedIn && account.isConnected && (
              <>
                <h2 className={"py-6 text-black " + open.className}>
                  Your connected account is {account.address}
                </h2>

                <h2 className={"font-bold text-black " + open.className}>
                  Your base price is <br />
                  {rangeValue} ETH
                </h2>
                <input
                  type="range"
                  min={"0.01"}
                  max="1"
                  step="0.01"
                  value={rangeValue}
                  onChange={handleRangeChange}
                  className="range range-primary range-xs"
                />
                <h2 className={"font-bold text-black " + open.className}>
                  Your Telegram Id is
                </h2>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input m-2 w-full max-w-xs text-black"
                  onChange={handleTelegramIdChange}
                />
                {/* Render "Go to Manage Requests" button after the user is signed in and wallet is connected */}
                <Link href="/manage-requests">
                  <button
                    className={
                      "m-6 btn btn-md rounded-full btn-neutral shadow-xl text-white " +
                      open.className
                    }
                  >
                    Manage Requests
                  </button>
                </Link>
                <button
                  className={
                    "m-6 btn btn-md rounded-full btn-neutral shadow-xl text-white " +
                    open.className
                  }
                  onClick={handleUpdateProfile}
                >
                  Update Profile
                </button>
                <button
                  className={
                    "m-6 btn btn-md rounded-full btn-primary shadow-xl text-white " +
                    open.className
                  }
                  onClick={handleCopy}
                >
                  Share your profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {toastVisible && (
        <div className="toast">
          <div className="alert text-white alert-info">
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}
      {toastUpdateProfile && (
        <div className="toast">
          <div className="alert text-white alert-info">
            <span>Profile updated!</span>
          </div>
        </div>
      )}
    </>
  );
}