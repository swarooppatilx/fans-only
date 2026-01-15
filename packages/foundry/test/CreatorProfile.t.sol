// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CreatorProfile.sol";

contract CreatorProfileTest is Test {
    CreatorProfile public creatorProfile;

    address public owner = address(this);
    address public platformWallet = makeAddr("platform");
    address public creator1 = makeAddr("creator1");
    address public creator2 = makeAddr("creator2");
    address public subscriber1 = makeAddr("subscriber1");
    address public subscriber2 = makeAddr("subscriber2");

    // Test data
    string constant USERNAME = "testcreator";
    string constant DISPLAY_NAME = "Test Creator";
    string constant BIO = "This is my bio";
    string constant PROFILE_CID = "QmProfileHash123";
    string constant BANNER_CID = "QmBannerHash456";
    string constant TIER_NAME = "Basic";
    string constant TIER_DESC = "Basic tier access";
    uint256 constant TIER_PRICE = 0.1 ether;

    event CreatorRegistered(address indexed creator, string username, uint256 timestamp);
    event TierCreated(address indexed creator, uint256 tierId, string name, uint256 price);
    event Subscribed(
        address indexed subscriber, address indexed creator, uint256 tierId, uint256 price, uint256 endTime
    );
    event Tipped(address indexed tipper, address indexed creator, uint256 amount, uint256 platformFee);

    function setUp() public {
        creatorProfile = new CreatorProfile(platformWallet);

        // Fund test accounts
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(subscriber1, 10 ether);
        vm.deal(subscriber2, 10 ether);
    }

    // ============ Constructor Tests ============

    function test_Constructor_SetsPlatformWallet() public view {
        assertEq(creatorProfile.platformWallet(), platformWallet);
    }

    function test_Constructor_SetsOwner() public view {
        assertEq(creatorProfile.owner(), owner);
    }

    function test_Constructor_RevertsWithZeroAddress() public {
        vm.expectRevert(CreatorProfile.InvalidAddress.selector);
        new CreatorProfile(address(0));
    }

    // ============ Creator Registration Tests ============

    function test_RegisterCreator_Success() public {
        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit CreatorRegistered(creator1, USERNAME, block.timestamp);

        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);

        assertTrue(creatorProfile.isCreator(creator1));
        assertEq(creatorProfile.usernameToAddress(USERNAME), creator1);
        assertEq(creatorProfile.getTotalCreators(), 1);

        CreatorProfile.Creator memory creator = creatorProfile.getCreator(creator1);
        assertEq(creator.username, USERNAME);
        assertEq(creator.displayName, DISPLAY_NAME);
        assertEq(creator.bio, BIO);
        assertEq(creator.profileImageCID, PROFILE_CID);
        assertEq(creator.bannerImageCID, BANNER_CID);
        assertFalse(creator.isVerified);
        assertTrue(creator.isActive);
    }

    function test_RegisterCreator_RevertsIfAlreadyCreator() public {
        vm.startPrank(creator1);
        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);

        vm.expectRevert(CreatorProfile.AlreadyACreator.selector);
        creatorProfile.registerCreator("another", DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
        vm.stopPrank();
    }

    function test_RegisterCreator_RevertsIfUsernameTaken() public {
        vm.prank(creator1);
        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);

        vm.prank(creator2);
        vm.expectRevert(CreatorProfile.UsernameAlreadyTaken.selector);
        creatorProfile.registerCreator(USERNAME, "Other Name", BIO, PROFILE_CID, BANNER_CID);
    }

    function test_RegisterCreator_RevertsIfUsernameTooShort() public {
        vm.prank(creator1);
        vm.expectRevert(CreatorProfile.InvalidUsername.selector);
        creatorProfile.registerCreator("ab", DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
    }

    function test_RegisterCreator_RevertsIfUsernameTooLong() public {
        vm.prank(creator1);
        vm.expectRevert(CreatorProfile.InvalidUsername.selector);
        creatorProfile.registerCreator("thisusernameiswaytoolong", DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
    }

    // ============ Tier Tests ============

    function test_CreateTier_Success() public {
        _registerCreator(creator1, USERNAME);

        vm.prank(creator1);
        vm.expectEmit(true, false, false, true);
        emit TierCreated(creator1, 0, TIER_NAME, TIER_PRICE);

        creatorProfile.createTier(TIER_NAME, TIER_DESC, TIER_PRICE);

        CreatorProfile.SubscriptionTier[] memory tiers = creatorProfile.getCreatorTiers(creator1);
        assertEq(tiers.length, 1);
        assertEq(tiers[0].name, TIER_NAME);
        assertEq(tiers[0].description, TIER_DESC);
        assertEq(tiers[0].price, TIER_PRICE);
        assertTrue(tiers[0].isActive);
    }

    function test_CreateTier_RevertsIfNotCreator() public {
        vm.prank(creator1);
        vm.expectRevert(CreatorProfile.NotACreator.selector);
        creatorProfile.createTier(TIER_NAME, TIER_DESC, TIER_PRICE);
    }

    function test_CreateTier_RevertsIfMaxTiersReached() public {
        _registerCreator(creator1, USERNAME);

        vm.startPrank(creator1);
        for (uint256 i = 0; i < 5; i++) {
            creatorProfile.createTier(string.concat("Tier ", vm.toString(i)), TIER_DESC, TIER_PRICE);
        }

        vm.expectRevert(CreatorProfile.MaxTiersReached.selector);
        creatorProfile.createTier("Tier 6", TIER_DESC, TIER_PRICE);
        vm.stopPrank();
    }

    function test_DeactivateTier_Success() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.prank(creator1);
        creatorProfile.deactivateTier(0);

        CreatorProfile.SubscriptionTier[] memory tiers = creatorProfile.getCreatorTiers(creator1);
        assertFalse(tiers[0].isActive);
    }

    // ============ Subscription Tests ============

    function test_Subscribe_Success() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        uint256 creatorBalanceBefore = creator1.balance;
        uint256 platformBalanceBefore = platformWallet.balance;

        vm.prank(subscriber1);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);

        // Check subscription
        assertTrue(creatorProfile.isSubscribed(creator1, subscriber1));

        CreatorProfile.Subscription memory sub = creatorProfile.getSubscription(creator1, subscriber1);
        assertEq(sub.tierId, 0);
        assertTrue(sub.isActive);
        assertEq(sub.endTime, block.timestamp + 30 days);

        // Check payments (5% platform fee)
        uint256 platformFee = (TIER_PRICE * 5) / 100;
        uint256 creatorAmount = TIER_PRICE - platformFee;
        assertEq(creator1.balance, creatorBalanceBefore + creatorAmount);
        assertEq(platformWallet.balance, platformBalanceBefore + platformFee);

        // Check creator stats
        CreatorProfile.Creator memory creator = creatorProfile.getCreator(creator1);
        assertEq(creator.totalSubscribers, 1);
        assertEq(creator.totalEarnings, creatorAmount);
    }

    function test_Subscribe_RevertsIfInsufficientPayment() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.InsufficientPayment.selector);
        creatorProfile.subscribe{ value: TIER_PRICE - 1 }(creator1, 0);
    }

    function test_Subscribe_RevertsIfAlreadySubscribed() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.startPrank(subscriber1);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);

        vm.expectRevert(CreatorProfile.AlreadySubscribed.selector);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);
        vm.stopPrank();
    }

    function test_Subscribe_RevertsIfTierNotActive() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.prank(creator1);
        creatorProfile.deactivateTier(0);

        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.TierNotActive.selector);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);
    }

    function test_Subscribe_RevertsIfInvalidCreator() public {
        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.NotACreator.selector);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);
    }

    // ============ Renewal Tests ============

    function test_RenewSubscription_Success() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.prank(subscriber1);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);

        // Fast forward 25 days
        vm.warp(block.timestamp + 25 days);

        uint256 originalEndTime = creatorProfile.getSubscription(creator1, subscriber1).endTime;

        vm.prank(subscriber1);
        creatorProfile.renewSubscription{ value: TIER_PRICE }(creator1);

        CreatorProfile.Subscription memory sub = creatorProfile.getSubscription(creator1, subscriber1);
        assertEq(sub.endTime, originalEndTime + 30 days);
    }

    function test_RenewSubscription_RevertsIfNotSubscribed() public {
        _registerCreator(creator1, USERNAME);
        _createTier(creator1);

        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.NotSubscribed.selector);
        creatorProfile.renewSubscription{ value: TIER_PRICE }(creator1);
    }

    // ============ Tip Tests ============

    function test_TipCreator_Success() public {
        _registerCreator(creator1, USERNAME);

        uint256 tipAmount = 0.05 ether;
        uint256 creatorBalanceBefore = creator1.balance;
        uint256 platformBalanceBefore = platformWallet.balance;
        CreatorProfile.Creator memory creatorBefore = creatorProfile.getCreator(creator1);

        vm.prank(subscriber1);
        vm.expectEmit(true, true, false, true);
        emit Tipped(subscriber1, creator1, tipAmount, (tipAmount * 5) / 100);
        creatorProfile.tipCreator{ value: tipAmount }(creator1);

        // Check payments (5% platform fee)
        uint256 platformFee = (tipAmount * 5) / 100;
        uint256 creatorAmount = tipAmount - platformFee;
        assertEq(creator1.balance, creatorBalanceBefore + creatorAmount);
        assertEq(platformWallet.balance, platformBalanceBefore + platformFee);

        // Check creator earnings updated
        CreatorProfile.Creator memory creatorAfter = creatorProfile.getCreator(creator1);
        assertEq(creatorAfter.totalEarnings, creatorBefore.totalEarnings + creatorAmount);
    }

    function test_TipCreator_RevertsIfZeroAmount() public {
        _registerCreator(creator1, USERNAME);

        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.InsufficientPayment.selector);
        creatorProfile.tipCreator{ value: 0 }(creator1);
    }

    function test_TipCreator_RevertsIfInvalidCreator() public {
        vm.prank(subscriber1);
        vm.expectRevert(CreatorProfile.NotACreator.selector);
        creatorProfile.tipCreator{ value: 0.01 ether }(creator1);
    }

    function test_TipCreator_RevertsIfSelfTipping() public {
        _registerCreator(creator1, USERNAME);

        vm.prank(creator1);
        vm.expectRevert(CreatorProfile.CannotTipYourself.selector);
        creatorProfile.tipCreator{ value: 0.01 ether }(creator1);
    }

    // ============ View Function Tests ============

    function test_GetCreators_Pagination() public {
        // Register 5 creators
        for (uint256 i = 0; i < 5; i++) {
            address creator = makeAddr(string.concat("creator", vm.toString(i)));
            vm.prank(creator);
            creatorProfile.registerCreator(
                string.concat("user", vm.toString(i)), DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID
            );
        }

        // Get first 3
        address[] memory batch1 = creatorProfile.getCreators(0, 3);
        assertEq(batch1.length, 3);

        // Get next 2
        address[] memory batch2 = creatorProfile.getCreators(3, 3);
        assertEq(batch2.length, 2);

        // Get with offset past end
        address[] memory batch3 = creatorProfile.getCreators(10, 5);
        assertEq(batch3.length, 0);
    }

    function test_GetCreatorByUsername() public {
        _registerCreator(creator1, USERNAME);

        address found = creatorProfile.getCreatorByUsername(USERNAME);
        assertEq(found, creator1);
    }

    // ============ Admin Tests ============

    function test_VerifyCreator_Success() public {
        _registerCreator(creator1, USERNAME);

        creatorProfile.verifyCreator(creator1);

        CreatorProfile.Creator memory creator = creatorProfile.getCreator(creator1);
        assertTrue(creator.isVerified);
    }

    function test_VerifyCreator_RevertsIfNotOwner() public {
        _registerCreator(creator1, USERNAME);

        vm.prank(creator2);
        vm.expectRevert();
        creatorProfile.verifyCreator(creator1);
    }

    function test_UpdatePlatformWallet_Success() public {
        address newWallet = makeAddr("newPlatform");
        creatorProfile.updatePlatformWallet(newWallet);
        assertEq(creatorProfile.platformWallet(), newWallet);
    }

    function test_Pause_BlocksRegistration() public {
        creatorProfile.pause();

        vm.prank(creator1);
        vm.expectRevert();
        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
    }

    function test_Unpause_AllowsRegistration() public {
        creatorProfile.pause();
        creatorProfile.unpause();

        vm.prank(creator1);
        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);

        assertTrue(creatorProfile.isCreator(creator1));
    }

    // ============ Helper Functions ============

    function _registerCreator(address _creator, string memory _username) internal {
        vm.prank(_creator);
        creatorProfile.registerCreator(_username, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
    }

    function _createTier(address _creator) internal {
        vm.prank(_creator);
        creatorProfile.createTier(TIER_NAME, TIER_DESC, TIER_PRICE);
    }
}
