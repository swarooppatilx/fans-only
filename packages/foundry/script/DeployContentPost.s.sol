// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/ContentPost.sol";

/**
 * @notice Deploy script for ContentPost contract
 * @dev Requires CreatorProfile to be deployed first
 * Example:
 * yarn deploy --file DeployContentPost.s.sol  # local anvil chain
 * yarn deploy --file DeployContentPost.s.sol --network mantleSepolia # Mantle testnet
 */
contract DeployContentPost is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Get CreatorProfile address from deployments
        // In production, this should be read from deployment artifacts
        address creatorProfileAddress = vm.envOr("CREATOR_PROFILE_ADDRESS", address(0));

        if (creatorProfileAddress == address(0)) {
            // Try to read from latest deployment
            string memory root = vm.projectRoot();
            string memory path = string.concat(root, "/broadcast/DeployCreatorProfile.s.sol/31337/run-latest.json");

            try vm.readFile(path) returns (string memory json) {
                // Parse the deployment to get CreatorProfile address
                // For now, we'll require the env var
                revert("Set CREATOR_PROFILE_ADDRESS env var with deployed CreatorProfile address");
            } catch {
                revert("CreatorProfile must be deployed first. Set CREATOR_PROFILE_ADDRESS env var.");
            }
        }

        ContentPost contentPost = new ContentPost(creatorProfileAddress);

        console.log("ContentPost deployed at:", address(contentPost));
        console.log("CreatorProfile address:", creatorProfileAddress);
    }
}
