"use client";

import { useState } from 'react';
import PendingPage from '../components/PendingPage';
import SentPage from '../components/SentPage';
import ApprovedPage from '../components/ApprovedPage';
import { useAuth } from '../context/authContext';

type PageType = 'Pending' | 'Sent' | 'Approved';

export default function Home() {
  const [activePage, setActivePage] = useState<PageType>('Pending');

  // Function to render the correct component based on the active page
  const renderPage = () => {
      case 'Pending':
        return <PendingPage />;
        return <SentPage />;
      case 'Approved':
        return <ApprovedPage />;
      default:
        return <PendingPage />;
    }
  };

  const { user, loading } = useAuth();
    switch (activePage) {
      case 'Sent':
  return (
    <div>
      <h1>We manage requests here</h1>

      <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
        <li>
          <a onClick={() => setActivePage('Pending')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Pending
            <span className="badge badge-sm badge-warning">NEW</span>
          </a>
        </li>
        <li>
          <a onClick={() => setActivePage('Sent')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sent
            <span className="badge badge-sm">1+</span>
          </a>
        </li>
        <li>
          <a onClick={() => setActivePage('Approved')}>
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
