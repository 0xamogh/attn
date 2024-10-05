"use client";

import { useEffect, useState } from 'react';
import PendingPage from '../components/PendingPage';
import SentPage from '../components/SentPage';
import ApprovedPage from '../components/ApprovedPage';
import { useAuth } from '../context/authContext';
import db from '@/lib/firebase/firestore';
import { query, collection, where, getDocs } from '@firebase/firestore';
import { useWriteContract } from 'wagmi';
import {open, playfair} from "../../lib/font/font"
type PageType = 'Pending' | 'Sent' | 'Approved';

export default function Home() {
  const [activePage, setActivePage] = useState<PageType>('Pending');
  const { user, loading } = useAuth();

  const [sentPendingCount, setSentPendingCount] = useState(0); // Count for sent pending requests
  const [newIncomingCount, setNewIncomingCount] = useState(0); // Count for new incoming requests
  const [fetching, setFetching] = useState(true);
  const {
    writeContract,
    isError: isContractWriteError,
    isPending: isContractWritePending,
    isSuccess: isContractWriteSuccess,
  } = useWriteContract();
  
  useEffect(() => {
    if (!loading && user) {
      const fetchRequestCounts = async () => {
        try {
          // Query for counting sent requests with status "pending"
          const sentQuery = query(
            collection(db, "requests"),
            where("fromId", "==", user.uid),
            where("status", "==", "pending")
          );
          const sentSnapshot = await getDocs(sentQuery);
          setSentPendingCount(sentSnapshot.size); // Set the count for pending sent requests

          // Query for counting new incoming requests with status "pending"
          const incomingQuery = query(
            collection(db, "requests"),
            where("toId", "==", user.uid),
            where("status", "==", "pending")
          );
          const incomingSnapshot = await getDocs(incomingQuery);
          setNewIncomingCount(incomingSnapshot.size); // Set the count for new pending incoming requests
        } catch (error) {
          console.error("Error fetching request counts: ", error);
        } finally {
          setFetching(false);
        }
      };

      fetchRequestCounts();
    }
  }, [loading, user]);

  // Function to render the correct component based on the active page
  const renderPage = () => {
    switch (activePage) {
      case 'Pending':
        return <PendingPage />;
      case 'Sent':
        return <SentPage />;
      case 'Approved':
        return <ApprovedPage />;
      default:
        return <PendingPage />;
    }
  };

  return (
    <div>
      <h1 className={"py-6 text-black text-6xl " + playfair.className}>
        <span className="italic">attn.</span> please
      </h1>

      <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Pending")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Pending
            {/* Show the count of new pending requests */}
            {newIncomingCount > 0 && (
              <span className="badge badge-sm badge-warning">
                {newIncomingCount}
              </span>
            )}
          </a>
        </li>
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Sent")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Sent
            {/* Show the count of sent pending requests */}
            {sentPendingCount > 0 && (
              <span className="badge badge-sm">{sentPendingCount}</span>
            )}
          </a>
        </li>
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Approved")}>
            Approved
            <span className="badge badge-xs badge-info"></span>
          </a>
        </li>
      </ul>

      {/* Render the selected page */}
      <div>{renderPage()}</div>
    </div>
  );
}
