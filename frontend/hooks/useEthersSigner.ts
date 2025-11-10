import { useEffect, useState, useMemo } from "react";
import { useWalletClient } from "wagmi";
import { BrowserProvider, JsonRpcSigner } from "ethers";

async function walletClientToSigner(walletClient: any): Promise<JsonRpcSigner> {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  // Wait for provider to be ready
  await provider.ready;
  const signer = await provider.getSigner(account.address);
  // Ensure signer address is available
  const signerAddress = await signer.getAddress();
  if (!signerAddress) {
    throw new Error("Failed to get signer address");
  }
  return signer;
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: walletClient } = useWalletClient({ chainId });
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    if (!walletClient) {
      setSigner(undefined);
      return;
    }

    let cancelled = false;

    walletClientToSigner(walletClient)
      .then((s) => {
        if (!cancelled) {
          setSigner(s);
        }
      })
      .catch((error) => {
        console.error("Error creating signer:", error);
        if (!cancelled) {
          setSigner(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [walletClient]);

  return signer;
}

