"use client";

import { useAuth } from "../../context/authContext";
import React, { useEffect, useState } from "react";
import db from "../../../lib/firebase/firestore";
import { collection, doc, getDoc, setDoc, addDoc, query, where, getDocs } from "firebase/firestore"; // Firestore imports
import { useReadContract, useWriteContract } from "wagmi";
import { ATTENTION_ESCROW_ABI, ATTENTION_ESCROW_ADDRESS } from "@/app/constants/constants";
import { v4 as uuidv4 } from "uuid"; // UUID import (for generating unique IDs)
import { Abi } from "viem";
import { open, playfair } from "../../../lib/font/font";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function Profile({ params: { slug } }: BlogPostProps) {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState(""); // State to hold the message input
  const [fetching, setFetching] = useState(true);
  const [orderId] = useState(uuidv4());
  const [priceMultiplier, setPriceMultiplier] = useState(1); // State to hold the price multiplier
  const [basePrice, setBasePrice] = useState<number | null>(null); // State to store base price
  const {
    writeContract: createOrder,
    isError: isContractWriteError,
    isPending: isContractWritePending,
    isSuccess: isContractWriteSuccess,
  } = useWriteContract();

  const [isMyPage, setIsMyPage] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the user data, including base price, by matching screenName (or twitterUsername) with slug
        const q = query(
          collection(db, "users"),
          where("twitterUsername", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]; // Assuming screenName is unique
          const userData = userDoc.data();

          // Check if the logged-in user matches the queried user (user.uid)
          if (user && user.uid === userDoc.id) {
            console.log("Current user matches the queried user.");
            setIsMyPage(true)
            // Perform any additional actions if needed
          }

          // Set user data and base price
          setUserData(userData);
          setBasePrice(userData.price); // Assuming base price is stored under `price`
        } else {
          console.error("No matching user found!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setFetching(false);
      }
    };

    // Call the function to fetch user data if `slug` or `user` changes
    if (slug && user) {
      fetchUserData();
    }
  }, [user, slug]);

  const handleCreateOrder = () => {
    if (message.trim() && basePrice !== null) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1); // Adds 1 day to the current date

      const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000); // Convert to Unix timestamp in seconds
      const finalPrice = BigInt((basePrice * priceMultiplier).toFixed(0)); // Calculate final price

      console.log(finalPrice);
      
      createOrder({
        abi: ATTENTION_ESCROW_ABI,
        address: ATTENTION_ESCROW_ADDRESS,
        functionName: "createOrder",
        args: [orderId, expiryTimestamp, userData.walletAddress], // Pass necessary args for createOrder
        value: finalPrice, // Pass the selected price in eth
      });
    } else {
      alert("Message cannot be empty or base price not found");
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    try {
      const requestDocRef = doc(db, "requests", orderId);

      await setDoc(requestDocRef, {
        // @ts-ignore
        fromId: user.uid,
        toId: slug,
        message: message,
        status: "pending",
        timestamp: new Date(),
        orderId: orderId,
      });

      alert("Message sent successfully with custom orderId!");
      setMessage(""); // Clear message input
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  useEffect(() => {
    if (isContractWriteSuccess) {
      handleSendMessage();
    } else if (isContractWriteError) {
      console.log("contract write failed");
    } else {
      console.log("waiting");
    }
  }, [isContractWriteSuccess, isContractWriteError, isContractWritePending]);

    const [toastVisible, setToastVisible] = useState(false);

    const handleCopy = () => {
      const profileUrl = window.location.origin + "/profile/" + slug; // Your specific URL to be copied
      navigator.clipboard.writeText(profileUrl).then(() => {
        setToastVisible(true); // Show the toast
        setTimeout(() => setToastVisible(false), 3000); // Hide the toast after 3 seconds
      });
    };
  if (loading || fetching) {
    return <div>Loading...</div>;
  }

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          {/* Flexbox to align image and name side by side */}
          <div className="flex items-center justify-center mb-4">
            <img
              src={userData.photoUrl}
              className="w-40 h-40 rounded-lg shadow-2xl mr-4" // Increased size
              alt="User profile"
            />
            <div>
              <h1 className={"text-black text-4xl " + playfair.className}>
                {userData.name}
              </h1>
            </div>
          </div>

          {/* Move the description below the image and name */}
          <p className={"text-black text-base mb-4 " + open.className}>
            {`${userData.name} ${userData.description}. Get to know them better by sending a message!`}
          </p>

          {/* Add message and price section */}
          {!isMyPage && (
            <>
              <p className={"text-black " + open.className}>
                Wish to talk to {userData.name}? Type a message below and pay{" "}
                {basePrice ? `${basePrice} eth` : "loading..."} standard rate.
                Or if you wish to modify your price, use the slider below.
              </p>

              {basePrice && (
                <div className="py-4">
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.2"
                    value={priceMultiplier}
                    onChange={(e) =>
                      setPriceMultiplier(parseFloat(e.target.value))
                    }
                    className="range range-primary"
                  />
                  <p>
                    Selected price: {(basePrice * priceMultiplier).toFixed(2)}{" "}
                    eth
                  </p>
                </div>
              )}

              {/* Centered Textarea */}
              <div className="flex flex-col items-center">
                <textarea
                  className="textarea textarea-bordered w-full h-32" // Increased size
                  placeholder="Type your message here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {/* Centered Button */}
                <button
                  className="btn text-white btn-primary mt-4"
                  onClick={handleCreateOrder}
                >
                  Get Started
                </button>
              </div>
            </>
          )}
         {isMyPage &&  <button
            className={
              "m-6 btn btn-md rounded-full btn-primary shadow-xl text-white " +
              open.className
            }
            onClick={handleCopy}
          >
            Share your profile
          </button>}
        </div>
      </div>
      {toastVisible && (
        <div className="toast">
          <div className="alert text-white alert-info">
            <span>Link copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}
