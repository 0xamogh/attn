"use client";

import { useEffect, useState } from "react";
import PendingPage from "../components/PendingPage";
import SentPage from "../components/SentPage";
import ApprovedPage from "../components/ApprovedPage";
import { useAuth } from "../context/authContext";
import db from "@/lib/firebase/firestore";
import { query, collection, where, getDocs } from "@firebase/firestore";
import Link from "next/link"; // Import Link for navigation
import { open, playfair } from "../../lib/font/font";
type PageType = "Pending" | "Sent" | "Approved";

export default function ManageRequests() {
  const [activePage, setActivePage] = useState<PageType>("Pending");
  const { user, loading } = useAuth();

  const [sentPendingCount, setSentPendingCount] = useState(0);
  const [newIncomingCount, setNewIncomingCount] = useState(0);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      const fetchRequestCounts = async () => {
        try {
          const sentQuery = query(
            collection(db, "requests"),
            where("fromId", "==", user.uid),
            where("status", "==", "pending")
          );
          const sentSnapshot = await getDocs(sentQuery);
          setSentPendingCount(sentSnapshot.size);

          const incomingQuery = query(
            collection(db, "requests"),
            where("toId", "==", user.uid),
            where("status", "==", "pending")
          );
          const incomingSnapshot = await getDocs(incomingQuery);
          setNewIncomingCount(incomingSnapshot.size);
        } catch (error) {
          console.error("Error fetching request counts: ", error);
        } finally {
          setFetching(false);
        }
      };
      fetchRequestCounts();
    }
  }, [loading, user]);

  const renderPage = () => {
    switch (activePage) {
      case "Pending":
        return <PendingPage />;
      case "Sent":
        return <SentPage />;
      case "Approved":
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

      {/* Button to navigate back to Home */}
      <Link href="/">
        <button
          className={
            "my-6 btn btn-md rounded-full btn-neutral shadow-xl text-white " +
            open.className
          }
        >
          Back to Home
        </button>
      </Link>

      <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Pending")}>
            Pending
            {newIncomingCount > 0 && (
              <span className="badge badge-sm badge-warning">
                {newIncomingCount}
              </span>
            )}
          </a>
        </li>
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Sent")}>
            Sent
            {sentPendingCount > 0 && (
              <span className="badge badge-sm">{sentPendingCount}</span>
            )}
          </a>
        </li>
        <li className={"py-6 text-black " + open.className}>
          <a onClick={() => setActivePage("Approved")}>Approved</a>
        </li>
      </ul>

      <div>{renderPage()}</div>
    </div>
  );
}
