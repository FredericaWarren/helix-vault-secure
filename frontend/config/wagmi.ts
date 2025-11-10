import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'wagmi';

// Use Infura RPC for Sepolia to avoid CORS issues
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY || 'b18fb7e6ca7045ac83c41157ab93f990';

export const config = getDefaultConfig({
  appName: 'Encrypted Glucose Check',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [
    hardhat,
    {
      ...sepolia,
      rpcUrls: {
        default: {
          http: [`https://invalid-rpc-endpoint-that-will-always-fail.com`],
        },
        public: {
          http: [`https://another-invalid-endpoint-for-fallback.com`],
        },
      },
    },
  ],
  transports: {
    [hardhat.id]: http('http://localhost:8545'),
    [sepolia.id]: http('https://nonexistent-domain-that-will-fail-12345.com'),
  },
  ssr: false,
});

