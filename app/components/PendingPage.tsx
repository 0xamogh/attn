import React, { useEffect, useState } from 'react';
import db from '../../lib/firebase/firestore';
import { collection, doc, query, where, getDocs, updateDoc, getDoc } from "firebase/firestore"; // Firestore imports
import { useAuth } from '../context/authContext';

interface Request {
  id: string;
  fromId: string;
  message: string;
  status: string;
  timestamp: any;
}

interface UserProfile {
  name: string;
  photoUrl: string;
}

const PendingPage = (): JSX.Element => {
  const { user, loading } = useAuth(); // Get current user and loading state
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]); // State for pending requests
  const [fetching, setFetching] = useState(true); // State for data fetching
  const [profiles, setProfiles] = useState<{ [key: string]: UserProfile }>({}); // State for storing profile details

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!loading && user) {
        try {
          const requestsRef = collection(db, "requests");
          const q = query(requestsRef, where("toId", "==", user.uid), where("status", "==", "pending")); // Fetch only pending requests for current user
          const querySnapshot = await getDocs(q);

          const requests: Request[] = [];
          const profilePromises: Promise<void>[] = [];

          querySnapshot.forEach((doc) => {
            const requestData = doc.data() as Request;
            requests.push({ id: doc.id, ...requestData });

            // Fetch the profile data for each fromId
            const profilePromise = getDoc(doc(db, "users", requestData.fromId)).then((userDoc) => {
              if (userDoc.exists()) {
                setProfiles((prev) => ({
                  ...prev,
                  [requestData.fromId]: userDoc.data() as UserProfile,
                }));
              }
            });

            profilePromises.push(profilePromise);
          });

          setPendingRequests(requests);
          await Promise.all(profilePromises); // Ensure all profiles are loaded
        } catch (error) {
          console.error("Error fetching pending requests: ", error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchPendingRequests();
  }, [loading, user]);

  const handleStatusChange = async (requestId: string, status: string) => {
    try {
      const requestDocRef = doc(db, "requests", requestId);
      await updateDoc(requestDocRef, { status }); // Update request status in Firestore
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId)); // Remove request from pending list
    } catch (error) {
      console.error("Error updating request status: ", error);
    }
  };

  if (loading || fetching) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  return (
    <div>
      <h2>Pending Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>You have no pending requests.</p>
      ) : (
        <ul>
          {pendingRequests.map((request) => (
            <li key={request.id} className="mb-4 p-4 border rounded shadow-sm">
              <div>
                {/* Display sender's profile information */}
                {profiles[request.fromId] && (
                  <div>
                    <img
                      src={profiles[request.fromId].photoUrl}
                      alt="Profile"
                      className="max-w-xs rounded-full shadow-sm mb-2"
                    />
                    <p><strong>{profiles[request.fromId].name}</strong></p>
                  </div>
                )}
                <p><strong>Message:</strong> {request.message}</p>
                <p><strong>Sent on:</strong> {new Date(request.timestamp.toDate()).toLocaleString()}</p>
                
                {/* Buttons to Accept/Reject */}
                <button
                  className="btn btn-primary mr-2"
                  onClick={() => handleStatusChange(request.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleStatusChange(request.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingPage;
