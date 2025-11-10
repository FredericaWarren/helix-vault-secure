import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the GlucoseCheck contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the GlucoseCheck contract
 *
 *   npx hardhat --network localhost task:submit-glucose --value 150
 *   npx hardhat --network localhost task:check-risk
 *   npx hardhat --network localhost task:decrypt-risk
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the GlucoseCheck contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the GlucoseCheck contract
 *
 *   npx hardhat --network sepolia task:submit-glucose --value 150
 *   npx hardhat --network sepolia task:check-risk
 *   npx hardhat --network sepolia task:decrypt-risk
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the GlucoseCheck address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const glucoseCheck = await deployments.get("GlucoseCheck");

  console.log("GlucoseCheck address is " + glucoseCheck.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:submit-glucose --value 150
 *   - npx hardhat --network sepolia task:submit-glucose --value 150
 */
task("task:submit-glucose", "Submits an encrypted glucose value to the GlucoseCheck Contract")
  .addOptionalParam("address", "Optionally specify the GlucoseCheck contract address")
  .addParam("value", "The glucose value to submit")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const value = parseInt(taskArguments.value);
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Argument --value must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const GlucoseCheckDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GlucoseCheck");
    console.log(`GlucoseCheck: ${GlucoseCheckDeployment.address}`);

    const signers = await ethers.getSigners();

    const glucoseCheckContract = await ethers.getContractAt("GlucoseCheck", GlucoseCheckDeployment.address);

    // Encrypt the glucose value
    const encryptedGlucose = await fhevm
      .createEncryptedInput(GlucoseCheckDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    const tx = await glucoseCheckContract
      .connect(signers[0])
      .submitGlucose(encryptedGlucose.handles[0], encryptedGlucose.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`GlucoseCheck submitGlucose(${value}) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:check-risk
 *   - npx hardhat --network sepolia task:check-risk
 */
task("task:check-risk", "Checks if the submitted glucose value is high (> 140)")
  .addOptionalParam("address", "Optionally specify the GlucoseCheck contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const GlucoseCheckDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GlucoseCheck");
    console.log(`GlucoseCheck: ${GlucoseCheckDeployment.address}`);

    const signers = await ethers.getSigners();

    const glucoseCheckContract = await ethers.getContractAt("GlucoseCheck", GlucoseCheckDeployment.address);

    const tx = await glucoseCheckContract.connect(signers[0]).checkRisk();
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`GlucoseCheck checkRisk() succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-risk
 *   - npx hardhat --network sepolia task:decrypt-risk
 */
task("task:decrypt-risk", "Decrypts the risk assessment result")
  .addOptionalParam("address", "Optionally specify the GlucoseCheck contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const GlucoseCheckDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("GlucoseCheck");
    console.log(`GlucoseCheck: ${GlucoseCheckDeployment.address}`);

    const signers = await ethers.getSigners();

    const glucoseCheckContract = await ethers.getContractAt("GlucoseCheck", GlucoseCheckDeployment.address);

    const encryptedRiskResult = await glucoseCheckContract.getRiskResult(signers[0].address);
    if (encryptedRiskResult === ethers.ZeroHash) {
      console.log(`encrypted risk result: ${encryptedRiskResult}`);
      console.log("clear risk result    : Not available (check risk first)");
      return;
    }

    const clearRiskResult = await fhevm.userDecryptEbool(
      encryptedRiskResult,
      GlucoseCheckDeployment.address,
      signers[0],
    );
    console.log(`Encrypted risk result: ${encryptedRiskResult}`);
    console.log(`Clear risk result    : ${clearRiskResult} (true = high glucose, false = normal)`);
  });

