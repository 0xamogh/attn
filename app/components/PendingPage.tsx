import React, { useEffect, useState } from 'react';
import db from '../../lib/firebase/firestore';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore"; // Firestore imports
import { useAuth } from '../context/authContext';
import { useWriteContract } from 'wagmi';
import { ATTENTION_ESCROW_ABI, ATTENTION_ESCROW_ADDRESS } from '../constants/constants';
import { open, playfair } from "../../lib/font/font";

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
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [telegramUrl, setTelegramUrl] = useState(''); // State to hold the Telegram redirect URL
  const [currentFromId, setCurrentFromId] = useState(''); // Store the fromId for the modal
  const [userData, setUserData] = useState<any>();


  const {
    writeContract,
    isError: isContractWriteError,
    isPending: isContractWritePending,
    isSuccess: isContractWriteSuccess,
  } = useWriteContract();

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!loading && user && userData) {

        try {
          const requestsRef = collection(db, "requests"); // Reference to the requests collection
          const q = query(requestsRef, where("toId", "==", userData.twitterUsername), where("status", "==", "pending")); // Query for pending requests
          const querySnapshot = await getDocs(q)

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

    fetchPendingRequests();
  }, [loading, user, userData]); // Re-run the effect if loading or user changes

  const handleAccept = async (requestId: string, fromId: string) => {
    try {
      const requestDocRef = doc(db, "requests", requestId); // Reference to the specific request
      await updateDoc(requestDocRef, { status: "accepted" }); // Update the request status to accepted

      // Fetch the telegram ID for the 'fromId' user from Firestore
      const userDoc = await getDoc(doc(db, "users", fromId));
      const telegramID = userDoc.data()?.telegramID;

      if (telegramID) {
        // Set up the Telegram link with a custom message
        const telegramMessage = "Hey, I saw your request on ATTN, let's chat!";
        const telegramLink = `https://t.me/${telegramID}?text=${encodeURIComponent(telegramMessage)}`;
        setTelegramUrl(telegramLink);
        setCurrentFromId(fromId); // Store the fromId for the modal message
        setIsModalOpen(true); // Open the modal
      }

      // Remove the accepted request from the state
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
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

  const closeModalAndRedirect = () => {
    window.open(telegramUrl, '_blank'); // Open the Telegram chat in a new tab
    setIsModalOpen(false); // Close the modal
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
                        onSuccess: () => handleAccept(request.id, request.fromId),
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
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className={"text-lg font-bold text-black " + open.className}>
              You have accepted the chat request from {currentFromId}.
            </h3>
            <p className={"py-4 text-black " + open.className}>
              When you close this box, you will be redirected to their chat on Telegram.
            </p>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={closeModalAndRedirect}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPage;
