import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';

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
          http: [`https://sepolia.infura.io/v3/${INFURA_API_KEY}`],
        },
      },
    },
  ],
  ssr: false,
});

