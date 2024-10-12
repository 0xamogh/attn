"use client";

import { useAuth } from "../../context/authContext";
import React, { useEffect, useState } from "react";
import db from "../../../lib/firebase/firestore";
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore"; // Firestore imports
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

  useEffect(() => {
    // Fetch the user data, including base price
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", slug);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          setBasePrice(userData.price); // Assuming base price is stored under `price`
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setFetching(false);
      }
    };
    fetchUserData();
  }, [loading, user, slug]);

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
        value: finalPrice, // Pass the selected price in wei
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
            {`${userData.name} has been working as a Data professional for the past 3 years. Get to know them better by sending a message!`}
          </p>

          {/* Add message and price section */}
          <p className={"text-black " + open.className}>
            Wish to talk to {userData.name}? Type a message below and pay{" "}
            {basePrice ? `${basePrice} wei` : "loading..."} standard rate. Or
            if you wish to modify your price, use the slider below.
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
                Selected price: {(basePrice * priceMultiplier).toFixed(2)} wei
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
              className="btn btn-primary mt-4"
              onClick={handleCreateOrder}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
