import React, { useEffect, useState } from 'react';
import db from '../../lib/firebase/firestore';
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore"; // Firestore imports
import { useAuth } from '../context/authContext';
import { open, playfair } from "../../lib/font/font";
interface Request {
  id: string;
  toId: string;
  fromId: string;
  message: string;
  status: string; // Should include "pending", "accepted", "rejected"
  timestamp: any; // You can refine this to Firestore's Timestamp type if needed
}

const ApprovedPage = (): JSX.Element => {
  const { user, loading } = useAuth(); // Get the current user and loading state
  const [approvedRequests, setApprovedRequests] = useState<Request[]>([]); // State to hold an array of approved requests
  const [fetching, setFetching] = useState(true); // State to indicate if data is being fetched
  const [userData, setUserData] = useState<any>();

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      if (!loading && user && userData) {
        try {
          const requestsRef = collection(db, "requests"); // Reference to the requests collection
          const q = query(requestsRef, where("fromId", "==", userData.twitterUsername), where("status", "==", "accepted")); // Query for accepted requests
          const querySnapshot = await getDocs(q);

          const requests: Request[] = []; // Array to store the approved requests
          querySnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() } as Request); // Push each approved request to the array
          });

          setApprovedRequests(requests); // Set the fetched requests to state
        } catch (error) {
          console.error("Error fetching approved requests: ", error);
        } finally {
          setFetching(false); // Stop fetching once data is retrieved
        }
      }
       if (!userData && user) {
         try {
           const userDocRef = doc(db, "users", user.uid);
           const userDoc = await getDoc(userDocRef);
           if (userDoc.exists()) {
             // Store the fetched user data in state
             setUserData(userDoc.data());
           }
         } catch (error) {
           console.error("Error fetching sent requests: ", error);
         } finally {
           setFetching(false); // Stop fetching once data is retrieved
         }
       }
    };

    fetchApprovedRequests();
  }, [loading, user, userData]); // Re-run the effect if loading or user changes

  if (loading || fetching) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
  }

  return (
    <div>
      <h2>Approved Requests</h2>
      {approvedRequests.length === 0 ? (
        <p>You have no approved requests.</p>
      ) : (
        <ul>
          {approvedRequests.map((request) => (
            <li key={request.id} className="mb-4 p-4 border brder-black rounded shadow-sm">
              <p className={"text-black " + open.className}><strong>To:</strong> {request.toId}</p>
              <p className={"text-black " + open.className}><strong>Message:</strong> {request.message}</p>
              <p className={"text-black " + open.className}><strong>Status:</strong> {request.status}</p>
              <p className={"text-black " + open.className}><strong>Approved on:</strong> {new Date(request.timestamp.toDate()).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ApprovedPage;
