"use client"

import { useAuth } from "../../context/authContext";
import React, { useEffect, useState } from 'react';
import db from '../../../lib/firebase/firestore';
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore"; // Firestore imports

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function Profile({ params: { slug } }: BlogPostProps) {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState(''); // State to hold the message input
  const [fetching, setFetching] = useState(true);

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

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      alert('Message cannot be empty');
      return;
    }

    try {
      const requestDocRef = collection(db, "requests"); // Reference to the "messages" collection
      await addDoc(requestDocRef, {
        fromId: user.uid, // current logged-in user
        toId: slug, // user being viewed
        message: message, // the message input
        status: 'pending', // initial status
        timestamp: new Date(),
      });

      alert('Message sent successfully!');
      setMessage(''); // Clear the message input
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

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
            <button className="btn btn-primary" onClick={handleSendMessage}>
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
