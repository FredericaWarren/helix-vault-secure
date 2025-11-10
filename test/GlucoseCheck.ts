import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { GlucoseCheck, GlucoseCheck__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("GlucoseCheck")) as GlucoseCheck__factory;
  const glucoseCheckContract = (await factory.deploy()) as GlucoseCheck;
  const glucoseCheckContractAddress = await glucoseCheckContract.getAddress();

  return { glucoseCheckContract, glucoseCheckContractAddress };
}

describe("GlucoseCheck", function () {
  let signers: Signers;
  let glucoseCheckContract: GlucoseCheck;
  let glucoseCheckContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ glucoseCheckContract, glucoseCheckContractAddress } = await deployFixture());
  });

  it("glucose value should be uninitialized after deployment", async function () {
    const encryptedGlucose = await glucoseCheckContract.getGlucose(signers.alice.address);
    // Expect initial glucose to be bytes32(0) after deployment,
    // (meaning the encrypted glucose value is uninitialized)
    expect(encryptedGlucose).to.eq(ethers.ZeroHash);
  });

  it("submit glucose value and check if high (glucose > 140)", async function () {
    // Test case 1: glucose = 150 (should be high)
    const glucoseValue = 150;
    const encryptedGlucose = await fhevm
      .createEncryptedInput(glucoseCheckContractAddress, signers.alice.address)
      .add32(glucoseValue)
      .encrypt();

    // Submit glucose value
    let tx = await glucoseCheckContract
      .connect(signers.alice)
      .submitGlucose(encryptedGlucose.handles[0], encryptedGlucose.inputProof);
    await tx.wait();

    // Check risk
    tx = await glucoseCheckContract.connect(signers.alice).checkRisk();
    await tx.wait();

    // Get encrypted risk result
    const encryptedRiskResult = await glucoseCheckContract.getRiskResult(signers.alice.address);
    
    // Decrypt the result
    const clearRiskResult = await fhevm.userDecryptEbool(
      encryptedRiskResult,
      glucoseCheckContractAddress,
      signers.alice,
    );

    expect(clearRiskResult).to.eq(true); // 150 > 140, so should be true
  });

  it("submit low glucose value (glucose <= 140)", async function () {
    // Test case 2: glucose = 120 (should not be high)
    const glucoseValue = 120;
    const encryptedGlucose = await fhevm
      .createEncryptedInput(glucoseCheckContractAddress, signers.alice.address)
      .add32(glucoseValue)
      .encrypt();

    // Submit glucose value
    let tx = await glucoseCheckContract
      .connect(signers.alice)
      .submitGlucose(encryptedGlucose.handles[0], encryptedGlucose.inputProof);
    await tx.wait();

    // Check risk
    tx = await glucoseCheckContract.connect(signers.alice).checkRisk();
    await tx.wait();

    // Get encrypted risk result
    const encryptedRiskResult = await glucoseCheckContract.getRiskResult(signers.alice.address);
    
    // Decrypt the result
    const clearRiskResult = await fhevm.userDecryptEbool(
      encryptedRiskResult,
      glucoseCheckContractAddress,
      signers.alice,
    );

    expect(clearRiskResult).to.eq(false); // 120 <= 140, so should be false
  });

  it("submit glucose value at threshold (glucose = 140)", async function () {
    // Test case 3: glucose = 140 (should not be high, since we check > 140)
    const glucoseValue = 140;
    const encryptedGlucose = await fhevm
      .createEncryptedInput(glucoseCheckContractAddress, signers.alice.address)
      .add32(glucoseValue)
      .encrypt();

    // Submit glucose value
    let tx = await glucoseCheckContract
      .connect(signers.alice)
      .submitGlucose(encryptedGlucose.handles[0], encryptedGlucose.inputProof);
    await tx.wait();

    // Check risk
    tx = await glucoseCheckContract.connect(signers.alice).checkRisk();
    await tx.wait();

    // Get encrypted risk result
    const encryptedRiskResult = await glucoseCheckContract.getRiskResult(signers.alice.address);
    
    // Decrypt the result
    const clearRiskResult = await fhevm.userDecryptEbool(
      encryptedRiskResult,
      glucoseCheckContractAddress,
      signers.alice,
    );

    expect(clearRiskResult).to.eq(false); // 140 is not > 140, so should be false
  });
});

