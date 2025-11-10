import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { GlucoseCheck } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("GlucoseCheckSepolia", function () {
  let signers: Signers;
  let glucoseCheckContract: GlucoseCheck;
  let glucoseCheckContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const GlucoseCheckDeployment = await deployments.get("GlucoseCheck");
      glucoseCheckContractAddress = GlucoseCheckDeployment.address;
      glucoseCheckContract = await ethers.getContractAt("GlucoseCheck", GlucoseCheckDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("submit glucose value and check risk assessment", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    progress("Encrypting glucose value 150...");
    const encryptedGlucose = await fhevm
      .createEncryptedInput(glucoseCheckContractAddress, signers.alice.address)
      .add32(150)
      .encrypt();

    progress(
      `Call submitGlucose() GlucoseCheck=${glucoseCheckContractAddress} handle=${ethers.hexlify(encryptedGlucose.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await glucoseCheckContract
      .connect(signers.alice)
      .submitGlucose(encryptedGlucose.handles[0], encryptedGlucose.inputProof);
    await tx.wait();

    progress(`Call GlucoseCheck.checkRisk()...`);
    tx = await glucoseCheckContract.connect(signers.alice).checkRisk();
    await tx.wait();

    progress(`Call GlucoseCheck.getRiskResult()...`);
    const encryptedRiskResult = await glucoseCheckContract.getRiskResult(signers.alice.address);
    expect(encryptedRiskResult).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting GlucoseCheck.getRiskResult()=${encryptedRiskResult}...`);
    const clearRiskResult = await fhevm.userDecryptEbool(
      encryptedRiskResult,
      glucoseCheckContractAddress,
      signers.alice,
    );
    progress(`Clear GlucoseCheck.getRiskResult()=${clearRiskResult}`);

    expect(clearRiskResult).to.eq(true); // 150 > 140, so should be true
  });
});

