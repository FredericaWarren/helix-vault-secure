"use client";

export function errorNotDeployed(chainId: number | undefined) {
  const chainName = chainId === 11155111 ? "Sepolia" : chainId === 31337 ? "Hardhat" : `Chain ${chainId}`;
  const networkName = chainId === 11155111 ? "sepolia" : "your-network-name";
  
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          Contract Not Deployed
        </h2>
        <p className="text-white/80 mb-4 text-center">
          <span className="font-mono">GlucoseCheck.sol</span> contract is not deployed on{" "}
          <span className="font-mono">{chainName}</span> (chainId: {chainId})
        </p>
        <div className="bg-black/50 rounded-lg p-4 mt-6 mb-6">
          <p className="text-white/60 text-sm mb-2">To deploy on {chainName}, run:</p>
          <code className="text-green-400 text-sm block">
            # from pro12 directory<br />
            npx hardhat deploy --network {networkName}
          </code>
        </div>
        <p className="text-white/80 text-center">
          Or switch to the local <span className="font-mono">Hardhat Node</span> (chainId: 31337) using your Rainbow wallet.
        </p>
      </div>
    </div>
  );
}

