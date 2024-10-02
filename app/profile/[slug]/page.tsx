"use client"

import  {useAuth} from "../../context/authContext";
import React, { useEffect, useState } from 'react';
import db from '../../../lib/firebase/firestore';
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Firestore imports

interface BlogPostProps {
  params: {
    slug: string;
  };
}


export default function Profile({ params: { slug } }) {
  const {user, loading} = useAuth()
  const [userData, setUserData] = useState<any>(null);
  console.log("^_^ ~ file: page.tsx:18 ~ Profile ~ userData:", userData);

  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      // Fetch user data from Firestore
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
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
    }
  }, [loading, user]);

  if (loading || fetching) {
    return <div>Loading...</div>;
  }

  return (
    
<div
  className="hero min-h-screen"
  style={{
    backgroundImage: "url(https://t4.ftcdn.net/jpg/01/25/93/71/240_F_125937187_K6ae4w2j2cTldlBikheFfwFhl4mkw4I6.jpg)",
  }}>
  <div className="hero-overlay bg-opacity-60"></div>
  <div className="hero-content text-neutral-content text-center">
    <div className="max-w-md">
    <img
      src={userData.photoUrl}
      className="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 className="text-5xl font-bold">{userData.name}</h1>
      <p className="py-6">
        Alok is working as a Data professional since past 3 years. Go ahead and click the button to 
        start getting to know him better!
      </p>
      <textarea className="textarea textarea-bordered" placeholder="Type your message here"></textarea>
      
      <button className="btn btn-primary">Get Started</button>
    </div>
    </div>
  </div>
</div>
  );
};


