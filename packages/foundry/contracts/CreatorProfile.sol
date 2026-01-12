// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CreatorProfile
 * @author FansOnly Team
 * @notice Core contract for creator profiles and subscriptions on FansOnly platform
 * @dev Manages creator registration, subscription tiers, and subscriber management
 */
contract CreatorProfile is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5% platform fee
    uint256 public constant MAX_TIERS = 5;

    // ============ Structs ============
    struct Creator {
        string username;
        string displayName;
        string bio;
        string profileImageCID; // IPFS CID
        string bannerImageCID; // IPFS CID
        bool isVerified;
        bool isActive;
        uint256 createdAt;
        uint256 totalSubscribers;
        uint256 totalEarnings;
    }

    struct SubscriptionTier {
        string name;
        string description;
        uint256 price; // in wei (MNT)
        bool isActive;
    }

    struct Subscription {
        uint256 tierId;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    // ============ State Variables ============
    mapping(address => Creator) public creators;
    mapping(address => bool) public isCreator;
    mapping(address => SubscriptionTier[]) public creatorTiers;
    mapping(address => mapping(address => Subscription)) public subscriptions; // creator => subscriber => subscription
    mapping(string => address) public usernameToAddress;

    address[] public allCreators;
    address public platformWallet;

    // ============ Events ============
    event CreatorRegistered(address indexed creator, string username, uint256 timestamp);
    event CreatorProfileUpdated(address indexed creator, uint256 timestamp);
    event TierCreated(address indexed creator, uint256 tierId, string name, uint256 price);
    event TierUpdated(address indexed creator, uint256 tierId, string name, uint256 price);
    event TierDeactivated(address indexed creator, uint256 tierId);
    event Subscribed(
        address indexed subscriber,
        address indexed creator,
        uint256 tierId,
        uint256 price,
        uint256 endTime
    );
    event SubscriptionRenewed(
        address indexed subscriber,
        address indexed creator,
        uint256 tierId,
        uint256 newEndTime
    );
    event SubscriptionCancelled(address indexed subscriber, address indexed creator);
    event CreatorVerified(address indexed creator);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    // ============ Errors ============
    error NotACreator();
    error AlreadyACreator();
    error UsernameAlreadyTaken();
    error InvalidUsername();
    error InvalidTier();
    error TierNotActive();
    error MaxTiersReached();
    error AlreadySubscribed();
    error NotSubscribed();
    error InsufficientPayment();
    error TransferFailed();
    error InvalidAddress();

    // ============ Modifiers ============
    modifier onlyCreator() {
        if (!isCreator[msg.sender]) revert NotACreator();
        _;
    }

    modifier validCreator(address _creator) {
        if (!isCreator[_creator]) revert NotACreator();
        _;
    }

    // ============ Constructor ============
    constructor(address _platformWallet) Ownable(msg.sender) {
        if (_platformWallet == address(0)) revert InvalidAddress();
        platformWallet = _platformWallet;
    }

    // ============ Creator Functions ============

    /**
     * @notice Register as a new creator
     * @param _username Unique username for the creator
     * @param _displayName Display name shown on profile
     * @param _bio Creator's bio/description
     * @param _profileImageCID IPFS CID for profile image
     * @param _bannerImageCID IPFS CID for banner image
     */
    function registerCreator(
        string calldata _username,
        string calldata _displayName,
        string calldata _bio,
        string calldata _profileImageCID,
        string calldata _bannerImageCID
    ) external whenNotPaused {
        if (isCreator[msg.sender]) revert AlreadyACreator();
        if (bytes(_username).length < 3 || bytes(_username).length > 20) revert InvalidUsername();
        if (usernameToAddress[_username] != address(0)) revert UsernameAlreadyTaken();

        creators[msg.sender] = Creator({
            username: _username,
            displayName: _displayName,
            bio: _bio,
            profileImageCID: _profileImageCID,
            bannerImageCID: _bannerImageCID,
            isVerified: false,
            isActive: true,
            createdAt: block.timestamp,
            totalSubscribers: 0,
            totalEarnings: 0
        });

        isCreator[msg.sender] = true;
        usernameToAddress[_username] = msg.sender;
        allCreators.push(msg.sender);

        emit CreatorRegistered(msg.sender, _username, block.timestamp);
    }

    /**
     * @notice Update creator profile information
     * @param _displayName New display name
     * @param _bio New bio
     * @param _profileImageCID New profile image IPFS CID
     * @param _bannerImageCID New banner image IPFS CID
     */
    function updateProfile(
        string calldata _displayName,
        string calldata _bio,
        string calldata _profileImageCID,
        string calldata _bannerImageCID
    ) external onlyCreator whenNotPaused {
        Creator storage creator = creators[msg.sender];
        creator.displayName = _displayName;
        creator.bio = _bio;
        creator.profileImageCID = _profileImageCID;
        creator.bannerImageCID = _bannerImageCID;

        emit CreatorProfileUpdated(msg.sender, block.timestamp);
    }

    // ============ Tier Functions ============

    /**
     * @notice Create a new subscription tier
     * @param _name Tier name
     * @param _description Tier description
     * @param _price Tier price in wei
     */
    function createTier(
        string calldata _name,
        string calldata _description,
        uint256 _price
    ) external onlyCreator whenNotPaused {
        if (creatorTiers[msg.sender].length >= MAX_TIERS) revert MaxTiersReached();

        creatorTiers[msg.sender].push(
            SubscriptionTier({name: _name, description: _description, price: _price, isActive: true})
        );

        uint256 tierId = creatorTiers[msg.sender].length - 1;
        emit TierCreated(msg.sender, tierId, _name, _price);
    }

    /**
     * @notice Update an existing tier
     * @param _tierId Tier ID to update
     * @param _name New tier name
     * @param _description New tier description
     * @param _price New tier price
     */
    function updateTier(
        uint256 _tierId,
        string calldata _name,
        string calldata _description,
        uint256 _price
    ) external onlyCreator whenNotPaused {
        if (_tierId >= creatorTiers[msg.sender].length) revert InvalidTier();

        SubscriptionTier storage tier = creatorTiers[msg.sender][_tierId];
        tier.name = _name;
        tier.description = _description;
        tier.price = _price;

        emit TierUpdated(msg.sender, _tierId, _name, _price);
    }

    /**
     * @notice Deactivate a tier (existing subscriptions remain valid)
     * @param _tierId Tier ID to deactivate
     */
    function deactivateTier(uint256 _tierId) external onlyCreator {
        if (_tierId >= creatorTiers[msg.sender].length) revert InvalidTier();

        creatorTiers[msg.sender][_tierId].isActive = false;
        emit TierDeactivated(msg.sender, _tierId);
    }

    // ============ Subscription Functions ============

    /**
     * @notice Subscribe to a creator's tier
     * @param _creator Creator address to subscribe to
     * @param _tierId Tier ID to subscribe to
     */
    function subscribe(address _creator, uint256 _tierId) external payable nonReentrant whenNotPaused validCreator(_creator) {
        if (_tierId >= creatorTiers[_creator].length) revert InvalidTier();

        SubscriptionTier storage tier = creatorTiers[_creator][_tierId];
        if (!tier.isActive) revert TierNotActive();
        if (msg.value < tier.price) revert InsufficientPayment();

        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (sub.isActive && sub.endTime > block.timestamp) revert AlreadySubscribed();

        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorAmount = msg.value - platformFee;

        // Update subscription
        sub.tierId = _tierId;
        sub.startTime = block.timestamp;
        sub.endTime = block.timestamp + SUBSCRIPTION_DURATION;
        sub.isActive = true;

        // Update creator stats
        creators[_creator].totalSubscribers++;
        creators[_creator].totalEarnings += creatorAmount;

        // Transfer funds
        (bool successCreator,) = payable(_creator).call{value: creatorAmount}("");
        if (!successCreator) revert TransferFailed();

        (bool successPlatform,) = payable(platformWallet).call{value: platformFee}("");
        if (!successPlatform) revert TransferFailed();

        emit Subscribed(msg.sender, _creator, _tierId, msg.value, sub.endTime);
    }

    /**
     * @notice Renew an existing subscription
     * @param _creator Creator address to renew subscription for
     */
    function renewSubscription(address _creator) external payable nonReentrant whenNotPaused validCreator(_creator) {
        Subscription storage sub = subscriptions[_creator][msg.sender];
        if (!sub.isActive) revert NotSubscribed();

        SubscriptionTier storage tier = creatorTiers[_creator][sub.tierId];
        if (msg.value < tier.price) revert InsufficientPayment();

        // Calculate fees
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 creatorAmount = msg.value - platformFee;

        // Extend subscription from current end time or now (whichever is later)
        uint256 startFrom = sub.endTime > block.timestamp ? sub.endTime : block.timestamp;
        sub.endTime = startFrom + SUBSCRIPTION_DURATION;

        // Update creator earnings
        creators[_creator].totalEarnings += creatorAmount;

        // Transfer funds
        (bool successCreator,) = payable(_creator).call{value: creatorAmount}("");
        if (!successCreator) revert TransferFailed();

        (bool successPlatform,) = payable(platformWallet).call{value: platformFee}("");
        if (!successPlatform) revert TransferFailed();

        emit SubscriptionRenewed(msg.sender, _creator, sub.tierId, sub.endTime);
    }

    // ============ View Functions ============

    /**
     * @notice Check if an address is subscribed to a creator
     * @param _creator Creator address
     * @param _subscriber Subscriber address
     * @return bool True if actively subscribed
     */
    function isSubscribed(address _creator, address _subscriber) external view returns (bool) {
        Subscription storage sub = subscriptions[_creator][_subscriber];
        return sub.isActive && sub.endTime > block.timestamp;
    }

    /**
     * @notice Get subscription details
     * @param _creator Creator address
     * @param _subscriber Subscriber address
     * @return Subscription struct
     */
    function getSubscription(address _creator, address _subscriber) external view returns (Subscription memory) {
        return subscriptions[_creator][_subscriber];
    }

    /**
     * @notice Get all tiers for a creator
     * @param _creator Creator address
     * @return Array of SubscriptionTier structs
     */
    function getCreatorTiers(address _creator) external view returns (SubscriptionTier[] memory) {
        return creatorTiers[_creator];
    }

    /**
     * @notice Get creator profile
     * @param _creator Creator address
     * @return Creator struct
     */
    function getCreator(address _creator) external view returns (Creator memory) {
        return creators[_creator];
    }

    /**
     * @notice Get creator address by username
     * @param _username Creator username
     * @return Creator address
     */
    function getCreatorByUsername(string calldata _username) external view returns (address) {
        return usernameToAddress[_username];
    }

    /**
     * @notice Get total number of creators
     * @return uint256 Total creators count
     */
    function getTotalCreators() external view returns (uint256) {
        return allCreators.length;
    }

    /**
     * @notice Get paginated list of creators
     * @param _offset Starting index
     * @param _limit Number of creators to return
     * @return Array of creator addresses
     */
    function getCreators(uint256 _offset, uint256 _limit) external view returns (address[] memory) {
        uint256 total = allCreators.length;
        if (_offset >= total) {
            return new address[](0);
        }

        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }

        address[] memory result = new address[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allCreators[i];
        }

        return result;
    }

    // ============ Admin Functions ============

    /**
     * @notice Verify a creator (admin only)
     * @param _creator Creator address to verify
     */
    function verifyCreator(address _creator) external onlyOwner validCreator(_creator) {
        creators[_creator].isVerified = true;
        emit CreatorVerified(_creator);
    }

    /**
     * @notice Update platform wallet address
     * @param _newWallet New platform wallet address
     */
    function updatePlatformWallet(address _newWallet) external onlyOwner {
        if (_newWallet == address(0)) revert InvalidAddress();
        address oldWallet = platformWallet;
        platformWallet = _newWallet;
        emit PlatformWalletUpdated(oldWallet, _newWallet);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
