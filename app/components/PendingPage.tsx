import React, { useEffect, useState } from 'react';
import db from '../../lib/firebase/firestore';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore"; // Firestore imports
import { useAuth } from '../context/authContext';
import { useWriteContract } from 'wagmi';
import { ATTENTION_ESCROW_ABI, ATTENTION_ESCROW_ADDRESS } from '../constants/constants';

interface Request {
  id: string;
  fromId: string;
  message: string;
  status: string; // Should include "pending", "accepted", "rejected"
  timestamp: any; // Firestore timestamp type
  telegramID?: string; // Telegram ID field for the recipient (optional to avoid runtime errors)
}

const PendingPage = (): JSX.Element => {
  const { user, loading } = useAuth(); // Get the current user and loading state
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]); // State to hold an array of pending requests
  const [fetching, setFetching] = useState(true); // State to indicate if data is being fetched
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null); // State to hold the request being processed
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
          for (const docSnap of querySnapshot.docs) {
            const requestData = docSnap.data() as Request;
            // Fetch the Telegram ID from the user who sent the request
            const fromUserRef = doc(db, "users", requestData.fromId); // Assumes a "users" collection
            const fromUserDoc = await getDoc(fromUserRef);
            if (fromUserDoc.exists()) {
              const fromUserData = fromUserDoc.data();
              requestData.telegramID = fromUserData?.telegramID; // Add the Telegram ID to the request
            }
            requests.push({ id: docSnap.id, ...requestData });
          }

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


  const handleAccept = async (request: Request) => {
    try {
      const requestDocRef = doc(db, "requests", request.id); // Reference to the specific request
      await updateDoc(requestDocRef, { status: "accepted" }); // Update the request status to accepted
      setPendingRequests((prev) => prev.filter((r) => r.id !== request.id)); // Remove accepted request from the state
      setCurrentRequest(request); // Set the current request for modal display

      // Show the modal
      document.getElementById('accept_modal')?.showModal();
    } catch (error) {
      console.error("Error accepting request: ", error);
    }
  };

  const handleCloseModal = () => {
    // When the modal is closed, redirect to Telegram
    if (currentRequest && currentRequest.telegramID) {
      const telegramUrl = `https://t.me/${currentRequest.telegramID}?text=Hello,%20I%20saw%20your%20request%20on%20ATTN,%20let's%20chat!`;
      window.open(telegramUrl, '_blank'); // Open Telegram chat in a new tab
    }

    // Close the modal
    const modal = document.getElementById('accept_modal') as HTMLDialogElement;
    if (modal) modal.close(); // Close the modal
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
              <p>
                <strong>From:</strong> {request.fromId}
              </p>
              <p>
                <strong>Message:</strong> {request.message}
              </p>
              <p>
                <strong>Status:</strong> {request.status}
              </p>
              <p>
                <strong>Requested on:</strong>{" "}
                {new Date(request.timestamp.toDate()).toLocaleString()}
              </p>
              <div>
                <button
                  className="btn btn-success"
                  onClick={() =>
                    writeContract(
                      {
                        abi: ATTENTION_ESCROW_ABI,
                        address: ATTENTION_ESCROW_ADDRESS,
                        functionName: "completeOrder",
                        args: [request.id],
                      },
                      {
                        onSuccess: () => handleAccept(request),
                        onError: () => console.log("Failed to accept request"),
                      }
                    )
                  }
                >
                  Accept
                </button>
                <button
                  className="btn btn-danger"
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

      {/* Modal for acceptance */}
      <dialog id="accept_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">You have accepted the chat!</h3>
          {currentRequest && (
            <p className="py-4">
              You have accepted the chat request of <strong>{currentRequest.fromId}</strong>. When you close this box, you will be redirected to their chat on Telegram.
            </p>
          )}
          <div className="modal-action">
            <button className="btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default PendingPage;
