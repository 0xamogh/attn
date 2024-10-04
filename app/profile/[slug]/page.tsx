"use client"

import { useAuth } from "../../context/authContext";
import React, { useEffect, useState } from 'react';
import db from '../../../lib/firebase/firestore';
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore"; // Firestore imports
import {  useReadContract, useWriteContract } from 'wagmi'
import { ATTENTION_ESCROW_ABI, ATTENTION_ESCROW_ADDRESS } from "@/app/constants/constants";
import { v4 as uuidv4 } from 'uuid'; // UUID import (for generating unique IDs)
import { Abi } from "viem";
import { config } from "@/lib/wagmi/config";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function Profile({ params: { slug } }: BlogPostProps) {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  console.log("^_^ ~ file: page.tsx:22 ~ Profile ~ userData:", userData);

  const [message, setMessage] = useState(''); // State to hold the message input
  const [fetching, setFetching] = useState(true);
  const [orderId, _] = useState(uuidv4())
  const {
    writeContract: createOrder,
    isError: isContractWriteError,
    isPending: isContractWritePending,
    isSuccess: isContractWriteSuccess,
  } = useWriteContract();

  useEffect(() => {
    // if (!loading && user) {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", slug);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
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
    // }
  }, [loading, user, slug]);



  // Generate and store the requestId in state
  const [requestId, setRequestId] = useState("");

  const handleCreateOrder = () => {
    // Trigger the contract transaction if the message is not empty
    if (message.trim()) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1); // Adds 1 day to the current date

      const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000); // Convert to Unix timestamp in seconds
      console.log(expiryTimestamp); // Outputs the timestamp for 1 day in the future      setRequestId(orderId);

      createOrder({
        abi: ATTENTION_ESCROW_ABI,
        address: ATTENTION_ESCROW_ADDRESS,
        functionName: "createOrder",
        args: [orderId, expiryTimestamp, userData.walletAddress], // Pass the necessary arguments for createOrder
        value: BigInt("1"), // Send the ETH value in wei
      });
    } else {
      alert("Message cannot be empty");
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    try {
      const requestDocRef = doc(db, "requests", orderId); // Use doc() to set the document with a custom ID

      await setDoc(requestDocRef, {
        fromId: user.uid, // current logged-in user
        toId: slug, // user being viewed
        message: message, // the message input
        status: "pending", // initial status
        timestamp: new Date(),
        orderId: orderId, // Save the orderId in the document as well
      });

      alert("Message sent successfully with custom orderId!");
      setMessage(""); // Clear the message input
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

    useEffect(() => {
      if(isContractWriteSuccess){
        handleSendMessage()
      } else if (isContractWriteError) {
        console.log("contract write failed")
      } else {
        console.log("waiting")
      }
    },[isContractWriteSuccess, isContractWriteError, isContractWritePending]
  )
  if (loading || fetching) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="hero min-h-screen"
      style={{
        backgroundImage: "url(https://t4.ftcdn.net/jpg/01/25/93/71/240_F_125937187_K6ae4w2j2cTldlBikheFfwFhl4mkw4I6.jpg)",
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <img
            src={userData.photoUrl}
            className="max-w-sm rounded-lg shadow-2xl"
            alt="User profile"
          />
          <div>
            <h1 className="text-5xl font-bold">{userData.name}</h1>
            <p className="py-6">
              {`${userData.name} has been working as a Data professional for the past 3 years. Get to know them better by sending a message!`}
            </p>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Type your message here"
              value={message} // Bound to the message state
              onChange={(e) => setMessage(e.target.value)} // Update message state on input
            />
            <button className="btn btn-primary" onClick={handleCreateOrder}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}