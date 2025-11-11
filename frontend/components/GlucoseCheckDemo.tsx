"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useGlucoseCheck } from "@/hooks/useGlucoseCheck";
import { errorNotDeployed } from "./ErrorNotDeployed";
import { ethers } from "ethers";

/*
 * Main GlucoseCheck React component
 * - Submit encrypted glucose value
 * - Check risk assessment (glucose > 140)
 * - View and decrypt risk result
 */
export const GlucoseCheckDemo = () => {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [glucoseValue, setGlucoseValue] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const ethersSigner = useEthersSigner({ chainId });
  const ethersReadonlyProvider = publicClient ? new ethers.BrowserProvider(publicClient.transport as any) : undefined;

  const sameChainRef = useRef((currentChainId: number | undefined) => currentChainId === chainId);
  const sameSignerRef = useRef((currentSigner: ethers.JsonRpcSigner | undefined) => {
    if (!currentSigner || !ethersSigner) return false;
    // Compare addresses, not object references
    const currentAddress = currentSigner.address;
    const ethersSignerAddress = ethersSigner.address;
    if (!currentAddress || !ethersSignerAddress) return false;
    return currentAddress.toLowerCase() === ethersSignerAddress.toLowerCase();
  });

  // Update refs when chainId or ethersSigner changes
  useEffect(() => {
    sameChainRef.current = (currentChainId: number | undefined) => currentChainId === chainId;
  }, [chainId]);

  useEffect(() => {
    sameSignerRef.current = (currentSigner: ethers.JsonRpcSigner | undefined) => {
      if (!currentSigner || !ethersSigner) return false;
      const currentAddress = currentSigner.address;
      const ethersSignerAddress = ethersSigner.address;
      if (!currentAddress || !ethersSignerAddress) return false;
      return currentAddress.toLowerCase() === ethersSignerAddress.toLowerCase();
    };
  }, [ethersSigner]);

  const provider = publicClient?.transport as ethers.Eip1193Provider | undefined;

  // Only use mock chains for local development (chainId 31337)
  const initialMockChains = chainId === 31337 
    ? { 31337: "http://localhost:8545" } 
    : undefined;

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const glucoseCheck = useGlucoseCheck({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain: sameChainRef,
    sameSigner: sameSignerRef,
  });

  const handleSubmitGlucose = async () => {
    if (!glucoseValue) return;

    const value = parseInt(glucoseValue);
    if (isNaN(value) || value < 0) {
      return;
    }

    await glucoseCheck.submitGlucose(value);
  };

  const handleCheckRisk = async () => {
    await glucoseCheck.checkRisk();
  };

  const handleDecryptResult = async () => {
    glucoseCheck.decryptRiskResult();
  };

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-purple-700 active:bg-purple-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const titleClass = "font-semibold text-white text-lg mt-4 mb-2";

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white/80 mt-4">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            Connect Your Wallet
          </h2>
          <p className="text-white/80 text-center mb-6">
            Please connect your Rainbow wallet to use the Encrypted Glucose Check system
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  if (glucoseCheck.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  const hasGlucose = glucoseCheck.glucoseHandle && glucoseCheck.glucoseHandle !== ethers.ZeroHash;
  const hasRiskResult = glucoseCheck.riskResultHandle && glucoseCheck.riskResultHandle !== ethers.ZeroHash;

  return (
    <div className="grid w-full gap-6 max-w-4xl mx-auto">
      <div className="col-span-full flex justify-end">
        <ConnectButton />
      </div>

      <div className="col-span-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Submit Glucose Value</h2>
        <div className="flex gap-4">
          <input
            type="number"
            value={glucoseValue}
            onChange={(e) => setGlucoseValue(e.target.value)}
            placeholder="Enter glucose value (mg/dL)"
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="0"
          />
          <button
            className={buttonClass}
            onClick={handleSubmitGlucose}
            disabled={!glucoseCheck.canSubmit || !glucoseValue || isNaN(parseInt(glucoseValue)) || parseInt(glucoseValue) <= 0}
          >
            {glucoseCheck.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      <div className="col-span-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Risk Assessment</h2>
        <p className="text-white/80 mb-4">
          Check if your glucose level is high (glucose {'>'} 140 mg/dL)
        </p>
        <button
          className={buttonClass}
          onClick={handleCheckRisk}
          disabled={!glucoseCheck.canCheckRisk}
        >
          {glucoseCheck.isChecking ? "Checking..." : "Check Risk"}
        </button>
      </div>

      {hasRiskResult && (
        <div className="col-span-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Risk Result</h2>
          <p className="text-white/80 mb-4">
            Your encrypted risk assessment result is available. Decrypt to view the result.
          </p>
          <button
            className={buttonClass}
            onClick={handleDecryptResult}
            disabled={!glucoseCheck.canDecrypt}
          >
            {glucoseCheck.isDecrypting
              ? "Decrypting..."
              : glucoseCheck.isDecrypted
                ? `Decrypted: ${glucoseCheck.clearRiskResult ? "High" : "Normal"}`
                : "Decrypt Result"}
          </button>
          {glucoseCheck.isDecrypted && glucoseCheck.clearRiskResult !== undefined && (
            <div className="mt-4 p-4 bg-white/20 rounded-lg">
              <p className="text-white font-semibold">
                Result: {glucoseCheck.clearRiskResult ? "⚠️ High glucose (>140 mg/dL)" : "✅ Normal glucose (≤140 mg/dL)"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 系统状态区域已隐藏 */}
    </div>
  );
};

