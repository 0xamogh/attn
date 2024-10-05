import React, { useEffect, useState } from 'react';
import db from '../../lib/firebase/firestore';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"; // Firestore imports
import { useAuth } from '../context/authContext';
import { useWriteContract } from 'wagmi';
import { ATTENTION_ESCROW_ABI, ATTENTION_ESCROW_ADDRESS } from '../constants/constants';

interface Request {
  id: string;
  fromId: string;
  message: string;
  status: string; // Should include "pending", "accepted", "rejected"
  timestamp: any; // You can refine this to Firestore's Timestamp type if needed
}

const PendingPage = (): JSX.Element => {
  const { user, loading } = useAuth(); // Get the current user and loading state
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]); // State to hold an array of pending requests
  const [fetching, setFetching] = useState(true); // State to indicate if data is being fetched
  const {
    writeContract,
    isError: isContractWriteError,
    isPending: isContractWritePending,
    isSuccess: isContractWriteSuccess,
  } = useWriteContract();
  
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!loading && user) {
        try {
          const requestsRef = collection(db, "requests"); // Reference to the requests collection
          const q = query(requestsRef, where("toId", "==", user.uid), where("status", "==", "pending")); // Query for pending requests
          const querySnapshot = await getDocs(q);

          const requests: Request[] = []; // Array to store the pending requests
          querySnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() } as Request); // Push each pending request to the array
          });

          setPendingRequests(requests); // Set the fetched requests to state
        } catch (error) {
          console.error("Error fetching pending requests: ", error);
        } finally {
          setFetching(false); // Stop fetching once data is retrieved
        }
      }
    };

    fetchPendingRequests();
  }, [loading, user]); // Re-run the effect if loading or user changes


  const handleAccept = async (requestId: string) => {
    try {
      const requestDocRef = doc(db, "requests", requestId); // Reference to the specific request
      await updateDoc(requestDocRef, { status: "accepted" }); // Update the request status to accepted
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId)); // Remove accepted request from the state
    } catch (error) {
      console.error("Error accepting request: ", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const requestDocRef = doc(db, "requests", requestId); // Reference to the specific request
      await updateDoc(requestDocRef, { status: "rejected" }); // Update the request status to rejected
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId)); // Remove rejected request from the state
    } catch (error) {
      console.error("Error rejecting request: ", error);
    }
  };

  if (loading || fetching) {
    return <div>Loading...</div>; // Show a loading state while data is being fetched
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
              <p className={"text-black " + open.className}>
                <strong>From:</strong> {request.fromId}
              </p>
              <p className={"text-black " + open.className}>
                <strong>Message:</strong> {request.message}
              </p>
              <p className={"text-black " + open.className}>
                <strong>Status:</strong> {request.status}
              </p>
              <p className={"text-black " + open.className}>
                <strong>Requested on:</strong>{" "}
                {new Date(request.timestamp.toDate()).toLocaleString()}
              </p>
              <div>
                <button
                  className="btn btn-neutral text-white btn-md"
                  onClick={() =>
                    writeContract(
                      {
                        abi: ATTENTION_ESCROW_ABI,
                        address: ATTENTION_ESCROW_ADDRESS,
                        functionName: "completeOrder",
                        args: [request.id],
                      },
                      {
                        onSuccess: () => handleAccept(request.id),
                        onError: () => console.log("Failed to accept request"),
                      }
                    )
                  }
                >
                  Accept
                </button>
                <button
                  className="btn mx-5 btn-primary text-white"
                  onClick={() =>
                    writeContract(
                      {
                        abi: ATTENTION_ESCROW_ABI,
                        address: ATTENTION_ESCROW_ADDRESS,
                        functionName: "refundOrder",
                        args: [request.id],
                      },
                      {
                        onSuccess: () => handleReject(request.id),
                        onError: () => console.log("Failed to reject request"),
                      }
                    )
                  }
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
