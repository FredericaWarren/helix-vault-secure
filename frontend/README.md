# Encrypted Glucose Check Frontend

Next.js frontend application for the Encrypted Glucose Check dApp.

## Features

- **Rainbow Wallet Integration** - Connect wallet using RainbowKit
- **FHEVM Integration** - Full support for encrypted operations
- **Modern UI** - Built with Next.js, React, and Tailwind CSS

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Generate ABI files**

   Make sure the contract is deployed first, then:

   ```bash
   npm run genabi
   ```

3. **Start development server**

   ```bash
   # With mock mode (requires hardhat node running)
   npm run dev:mock
   
   # Regular mode
   npm run dev
   ```

## Configuration

### WalletConnect Project ID

Update `config/wagmi.ts` with your WalletConnect project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'Encrypted Glucose Check',
  projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
  chains: [sepolia, mainnet],
  ssr: false,
});
```

## FHEVM Files

The FHEVM integration files need to be copied from the template. Essential files include:

- `fhevm/useFhevm.tsx` - FHEVM instance hook
- `fhevm/FhevmDecryptionSignature.ts` - Decryption signature handling
- `fhevm/internal/fhevm.ts` - FHEVM instance creation
- `fhevm/internal/RelayerSDKLoader.ts` - SDK loader
- `fhevm/internal/PublicKeyStorage.ts` - Public key storage
- `fhevm/internal/constants.ts` - Constants
- `fhevm/internal/mock/fhevmMock.ts` - Mock implementation

Copy these from `fhevm-hardhat-template旧/frontend/fhevm/` to `pro12/frontend/fhevm/`.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Rainbow/wagmi providers
├── components/             # React components
│   ├── GlucoseCheckDemo.tsx  # Main component
│   └── ErrorNotDeployed.tsx   # Error component
├── hooks/                  # Custom hooks
│   └── useGlucoseCheck.tsx   # Contract interaction hook
├── fhevm/                  # FHEVM integration
├── config/                 # Configuration
│   └── wagmi.ts           # Wagmi/Rainbow config
└── scripts/                # Build scripts
    └── genabi.mjs         # ABI generator
```

## Development

The frontend uses:
- **Next.js 15** - React framework
- **RainbowKit** - Wallet connection UI
- **Wagmi** - Ethereum React hooks
- **FHEVM SDK** - Fully Homomorphic Encryption

## Building

```bash
npm run build
npm start
```

