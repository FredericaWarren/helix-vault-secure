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
  const [systemStatus, setSystemStatus] = useState<string>("Initializing...");
  const [glucoseHistory, setGlucoseHistory] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected && fhevmInstance && glucoseCheck.isDeployed) {
      setSystemStatus("Ready for glucose assessment");
    } else if (!isConnected) {
      setSystemStatus("Please connect your wallet");
    } else if (!fhevmInstance) {
      setSystemStatus("Initializing FHEVM...");
    } else if (!glucoseCheck.isDeployed) {
      setSystemStatus("Contract not deployed on this network");
    }
  }, [isConnected, fhevmInstance, glucoseCheck.isDeployed]);

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
    if (isNaN(value) || value <= 0 || value > 1000) {
      return;
    }

    setGlucoseHistory(prev => [...prev, value]);
    await glucoseCheck.submitGlucose(value);
  };

  const handleCheckRisk = async () => {
    await glucoseCheck.checkRisk();
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
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="number"
                value={glucoseValue}
                onChange={(e) => setGlucoseValue(e.target.value)}
                placeholder="Enter glucose value (mg/dL)"
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                max="1000"
              />
              <p className="text-white/60 text-sm mt-1">
                Normal range: 70-140 mg/dL. Values above 140 may indicate high risk.
              </p>
            </div>
            <button
              className={buttonClass}
              onClick={handleSubmitGlucose}
              disabled={!glucoseCheck.canSubmit || !glucoseValue || isNaN(parseInt(glucoseValue)) || parseInt(glucoseValue) <= 0 || parseInt(glucoseValue) > 1000}
            >
              {glucoseCheck.isSubmitting ? "Submitting..." : "Submit Glucose"}
            </button>
          </div>
          {glucoseValue && parseInt(glucoseValue) > 0 && (
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/80 text-sm">
                <span className="font-semibold">Preview:</span> Submitting {glucoseValue} mg/dL glucose value for encrypted risk assessment
              </p>
            </div>
          )}
          {glucoseHistory.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Recent Submissions</h3>
              <div className="flex flex-wrap gap-2">
                {glucoseHistory.slice(-3).map((value, index) => (
                  <span key={index} className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm">
                    {value} mg/dL
                  </span>
                ))}
              </div>
            </div>
          )}
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


      {/* Messages Section */}
      {glucoseCheck.message && (
        <div className="col-span-full bg-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">System Messages</h2>
          <p className="text-blue-200 font-mono text-sm">{glucoseCheck.message}</p>
        </div>
      )}

      {/* System Status Section */}
      <div className="col-span-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">System Status</h2>
        <div className="space-y-2">
          <p className="text-white/80">
            <span className="font-semibold">Connection:</span> {isConnected ? "Connected" : "Disconnected"}
          </p>
          <p className="text-white/80">
            <span className="font-semibold">Network:</span> {chainId === 31337 ? "Local Hardhat" : `Chain ${chainId}`}
          </p>
          <p className="text-white/80">
            <span className="font-semibold">FHEVM:</span> {fhevmStatus === "ready" ? "Ready" : "Loading..."}
          </p>
          <p className="text-white/80">
            <span className="font-semibold">Status:</span> {systemStatus}
          </p>
        </div>
      </div>
    </div>
  );
};

