// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Glucose Risk Assessment Contract
/// @author Encrypted Glucose Check
/// @notice A contract that performs encrypted glucose risk assessment using FHEVM.
/// @dev Users can submit encrypted glucose values and check if they exceed the threshold (140).
contract GlucoseCheck is SepoliaConfig {
    // Threshold for high glucose (mg/dL)
    uint32 private constant GLUCOSE_THRESHOLD = 140;
    
    // Mapping to store encrypted glucose values per user
    mapping(address => euint32) private userGlucoseValues;
    
    // Mapping to store encrypted risk assessment results (true if glucose > 140)
    mapping(address => ebool) private riskResults;
    
    event GlucoseSubmitted(address indexed user);
    event RiskAssessmentCompleted(address indexed user);

    /// @notice Submit an encrypted glucose value
    /// @param encryptedGlucose The encrypted glucose value as euint32
    /// @param inputProof The input proof for the encrypted value
    function submitGlucose(externalEuint32 encryptedGlucose, bytes calldata inputProof) external {
        euint32 glucose = FHE.fromExternal(encryptedGlucose, inputProof);
        
        userGlucoseValues[msg.sender] = glucose;
        
        FHE.allowThis(userGlucoseValues[msg.sender]);
        FHE.allow(userGlucoseValues[msg.sender], msg.sender);
        
        emit GlucoseSubmitted(msg.sender);
    }

    /// @notice Get the encrypted glucose value for a user
    /// @param user The address of the user
    /// @return The encrypted glucose value
    function getGlucose(address user) external view returns (euint32) {
        return userGlucoseValues[user];
    }

    /// @notice Check if the user's glucose is high (glucose > 140)
    /// @dev This function performs encrypted comparison without revealing the actual glucose value
    function checkRisk() external {
        require(FHE.isInitialized(userGlucoseValues[msg.sender]), "No glucose value submitted");
        
        // Encrypt the threshold value for comparison
        euint32 threshold = FHE.asEuint32(GLUCOSE_THRESHOLD);
        
        // Perform encrypted comparison: glucose > 140
        ebool isHigh = FHE.gt(userGlucoseValues[msg.sender], threshold);
        
        riskResults[msg.sender] = isHigh;
        
        FHE.allowThis(riskResults[msg.sender]);
        FHE.allow(riskResults[msg.sender], msg.sender);
        
        emit RiskAssessmentCompleted(msg.sender);
    }

    /// @notice Get the encrypted risk assessment result
    /// @param user The address of the user
    /// @return The encrypted boolean result (true if glucose > 140)
    function getRiskResult(address user) external view returns (ebool) {
        return riskResults[user];
    }
}

