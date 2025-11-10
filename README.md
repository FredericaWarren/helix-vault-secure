# Encrypted Glucose Check 🔒💉

An encrypted glucose risk assessment dApp built with FHEVM (Fully Homomorphic Encryption Virtual Machine) technology. This project allows users to submit encrypted glucose values and perform risk assessments without revealing their actual health data.

## 🚀 Live Demo

**Deployed on Vercel**: [https://medicalprivate.vercel.app/](https://medicalprivate.vercel.app/)

## 📹 Project Video

Watch the full project demonstration: [medical.mp4](./medical.mp4)

## 🏥 What This Project Does

This dApp enables users to:

1. **Submit Encrypted Glucose Values**: Users can input their glucose readings in an encrypted format using FHEVM technology
2. **Risk Assessment**: Perform encrypted comparison to check if glucose levels exceed the threshold (140 mg/dL) without revealing the actual values
3. **Privacy Protection**: All health data remains encrypted throughout the entire process
4. **Wallet Integration**: Connect with MetaMask or other Web3 wallets using RainbowKit

### Key Features

- 🔐 **Fully Homomorphic Encryption**: Uses Zama's FHEVM for encrypted computations
- 👛 **Wallet Integration**: RainbowKit for seamless wallet connection
- ⚡ **Modern UI**: Built with Next.js, React, and Tailwind CSS
- 🧪 **Testnet Deployment**: Deployed on Ethereum Sepolia testnet
- 🔒 **Privacy-First**: Health data never leaves the encrypted domain

## 🏗️ Architecture

### Smart Contract
- **Contract Name**: `GlucoseCheck.sol`
- **Network**: Ethereum Sepolia Testnet
- **Address**: `0xd68272712A56E9020290b520BAe958420ea47DCF`
- **Threshold**: 140 mg/dL (configurable)

### Tech Stack

#### Backend (Smart Contracts)
- **Solidity**: ^0.8.24
- **Hardhat**: Development framework
- **FHEVM**: Zama's Fully Homomorphic Encryption VM
- **OpenZeppelin**: Security standards

#### Frontend
- **Next.js**: React framework (v15)
- **TypeScript**: Type safety
- **Tailwind CSS**: Modern styling
- **RainbowKit**: Wallet connection UI
- **Wagmi**: Ethereum React hooks
- **FHEVM SDK**: Encryption integration

## 📋 Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- MetaMask or compatible Web3 wallet

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/FredericaWarren/helix-vault-secure.git
cd helix-vault-secure
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Start Hardhat Node (for development)

```bash
npm run compile
npx hardhat node
```

### 4. Configure WalletConnect

Update `frontend/config/wagmi.ts` with your WalletConnect project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'Encrypted Glucose Check',
  projectId: 'YOUR_PROJECT_ID', // Add your project ID here
  chains: [sepolia, mainnet],
  ssr: false,
});
```

### 5. Generate Contract ABIs

```bash
cd frontend
npm run genabi
```

### 6. Start Development Server

```bash
# Mock mode (with local Hardhat node)
npm run dev:mock

# Or regular mode
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

### Run Contract Tests

```bash
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Deploy to Sepolia Testnet

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Build Frontend for Production

```bash
cd frontend
npm run build
npm run start
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd68272712A56E9020290b520BAe958420ea47DCF
```

## 📁 Project Structure

```
.
├── contracts/              # Smart contracts
│   └── GlucoseCheck.sol   # Main contract
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── config/            # Configuration files
│   ├── fhevm/             # FHEVM integration
│   ├── hooks/             # Custom React hooks
│   └── scripts/           # Build scripts
├── test/                  # Contract tests
├── deploy/                # Deployment scripts
├── hardhat.config.ts      # Hardhat configuration
├── medical.mp4           # Project demonstration video
└── README.md             # This file
```

## 🔐 How FHEVM Works Here

1. **Encryption**: User inputs are encrypted using FHEVM before submission
2. **Storage**: Encrypted values are stored on-chain
3. **Computation**: Risk assessment (glucose > 140) happens encrypted
4. **Privacy**: No one can see actual glucose values except the user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) - For FHEVM technology
- [RainbowKit](https://www.rainbowkit.com/) - Wallet integration
- [Next.js](https://nextjs.org/) - React framework
- [Hardhat](https://hardhat.org/) - Ethereum development environment

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**⚠️ Disclaimer**: This is a demonstration project for educational purposes. Not intended for medical use. Always consult healthcare professionals for medical advice.</contents>
</xai:function_call_explanation">Create a comprehensive README.md file for the project with all required information
