"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react';
import { baseSepolia } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';


export default function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>()
  const [queryClient, setQueryClient] = useState<any>()
  useEffect(()=> {
    const queryClientEffect = new QueryClient()
     const configEffect = createConfig({
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
    setQueryClient(queryClient)
    setConfig(configEffect)
  })
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      {children}
            </QueryClientProvider>

    </WagmiProvider>
  );
}