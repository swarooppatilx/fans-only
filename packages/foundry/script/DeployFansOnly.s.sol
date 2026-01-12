// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/CreatorProfile.sol";
import "../contracts/ContentPost.sol";

/**
 * @notice Deploy script for all FansOnly contracts
 * @dev Deploys CreatorProfile and ContentPost in sequence
 * Example:
 * yarn deploy --file DeployFansOnly.s.sol  # local anvil chain
 * yarn deploy --file DeployFansOnly.s.sol --network mantleSepolia # Mantle testnet
 */
contract DeployFansOnly is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Platform wallet receives 5% fees from subscriptions
        // In production, this should be a multisig or DAO treasury
        address platformWallet = deployer;

        // Deploy CreatorProfile
        CreatorProfile creatorProfile = new CreatorProfile(platformWallet);
        console.log("CreatorProfile deployed at:", address(creatorProfile));
        console.log("Platform wallet set to:", platformWallet);

        // Deploy ContentPost with CreatorProfile address
        ContentPost contentPost = new ContentPost(address(creatorProfile));
        console.log("ContentPost deployed at:", address(contentPost));

        console.log("");
        console.log("=== FansOnly Deployment Complete ===");
        console.log("CreatorProfile:", address(creatorProfile));
        console.log("ContentPost:", address(contentPost));
    }
}
