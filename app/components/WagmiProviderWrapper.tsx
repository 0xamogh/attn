"use client";

import { WagmiProvider, createConfig, http, cookieToInitialState } from "wagmi";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react';
import { baseSepolia } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';

const queryClient = new QueryClient();
const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: "Create Wagmi",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    // [base.id]: http()
  },
});

interface WagmiProviderWrapperProps {
  children: React.ReactNode;
  cookie: string | null;
}


export default function WagmiProviderWrapper({ children, cookie } : WagmiProviderWrapperProps) {
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
      {children}
            </QueryClientProvider>

    </WagmiProvider>
  );
}