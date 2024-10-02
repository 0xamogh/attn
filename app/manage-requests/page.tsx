'use client';

import { useAuth } from '../context/authContext';

export default function Dashboard() {
  const { user, loading } = useAuth();
  console.log("^_^ ~ file: page.tsx:8 ~ Dashboard ~ user:", user);


  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>User: {user?.uid}</p>
    </div>
  );
}