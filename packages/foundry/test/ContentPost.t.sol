// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CreatorProfile.sol";
import "../contracts/ContentPost.sol";

contract ContentPostTest is Test {
    CreatorProfile public creatorProfile;
    ContentPost public contentPost;

    address public owner = address(this);
    address public platformWallet = makeAddr("platform");
    address public creator1 = makeAddr("creator1");
    address public creator2 = makeAddr("creator2");
    address public subscriber1 = makeAddr("subscriber1");
    address public subscriber2 = makeAddr("subscriber2");
    address public nonSubscriber = makeAddr("nonSubscriber");

    // Test data
    string constant USERNAME = "testcreator";
    string constant DISPLAY_NAME = "Test Creator";
    string constant BIO = "This is my bio";
    string constant PROFILE_CID = "QmProfileHash123";
    string constant BANNER_CID = "QmBannerHash456";

    string constant CONTENT_CID = "QmContentHash789";
    string constant PREVIEW_CID = "QmPreviewHash012";
    string constant CAPTION = "Check out my new post!";

    uint256 constant TIER_PRICE = 0.1 ether;

    event PostCreated(
        uint256 indexed postId,
        address indexed creator,
        ContentPost.ContentType contentType,
        ContentPost.AccessLevel accessLevel,
        uint256 timestamp
    );
    event PostLiked(uint256 indexed postId, address indexed user);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed commenter);

    function setUp() public {
        creatorProfile = new CreatorProfile(platformWallet);
        contentPost = new ContentPost(address(creatorProfile));

        // Fund test accounts
        vm.deal(creator1, 10 ether);
        vm.deal(creator2, 10 ether);
        vm.deal(subscriber1, 10 ether);
        vm.deal(subscriber2, 10 ether);
        vm.deal(nonSubscriber, 10 ether);

        // Register creator1 and set up a tier
        vm.startPrank(creator1);
        creatorProfile.registerCreator(USERNAME, DISPLAY_NAME, BIO, PROFILE_CID, BANNER_CID);
        creatorProfile.createTier("Basic", "Basic access", TIER_PRICE);
        creatorProfile.createTier("Premium", "Premium access", TIER_PRICE * 2);
        vm.stopPrank();

        // Subscribe subscriber1 to creator1's basic tier
        vm.prank(subscriber1);
        creatorProfile.subscribe{ value: TIER_PRICE }(creator1, 0);
    }

    // ============ Post Creation Tests ============

    function test_CreatePost_Public_Success() public {
        vm.prank(creator1);
        vm.expectEmit(true, true, false, true);
        emit PostCreated(0, creator1, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, block.timestamp);

        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, 0
        );

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.id, 0);
        assertEq(post.creator, creator1);
        assertEq(post.contentCID, CONTENT_CID);
        assertEq(post.previewCID, PREVIEW_CID);
        assertEq(post.caption, CAPTION);
        assertTrue(post.isActive);
    }

    function test_CreatePost_SubscribersOnly_Success() public {
        vm.prank(creator1);
        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.VIDEO, ContentPost.AccessLevel.SUBSCRIBERS, 0
        );

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(uint256(post.accessLevel), uint256(ContentPost.AccessLevel.SUBSCRIBERS));
    }

    function test_CreatePost_TierGated_Success() public {
        vm.prank(creator1);
        contentPost.createPost(
            CONTENT_CID,
            PREVIEW_CID,
            CAPTION,
            ContentPost.ContentType.VIDEO,
            ContentPost.AccessLevel.TIER_GATED,
            1 // Premium tier
        );

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(uint256(post.accessLevel), uint256(ContentPost.AccessLevel.TIER_GATED));
        assertEq(post.requiredTierId, 1);
    }

    function test_CreatePost_RevertsIfNotCreator() public {
        vm.prank(subscriber1);
        vm.expectRevert(ContentPost.NotACreator.selector);
        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, 0
        );
    }

    function test_CreatePost_RevertsIfEmptyContent() public {
        vm.prank(creator1);
        vm.expectRevert(ContentPost.InvalidContent.selector);
        contentPost.createPost(
            "", PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, 0
        );
    }

    function test_CreatePost_RevertsIfInvalidTier() public {
        vm.prank(creator1);
        vm.expectRevert(ContentPost.InvalidTier.selector);
        contentPost.createPost(
            CONTENT_CID,
            PREVIEW_CID,
            CAPTION,
            ContentPost.ContentType.IMAGE,
            ContentPost.AccessLevel.TIER_GATED,
            99 // Invalid tier
        );
    }

    // ============ Access Control Tests ============

    function test_CanAccessPost_PublicPost_AnyoneCanAccess() public {
        _createPublicPost(creator1);

        assertTrue(contentPost.canAccessPost(0, creator1));
        assertTrue(contentPost.canAccessPost(0, subscriber1));
        assertTrue(contentPost.canAccessPost(0, nonSubscriber));
    }

    function test_CanAccessPost_SubscribersOnly_SubscriberCanAccess() public {
        _createSubscriberPost(creator1);

        assertTrue(contentPost.canAccessPost(0, creator1));
        assertTrue(contentPost.canAccessPost(0, subscriber1));
        assertFalse(contentPost.canAccessPost(0, nonSubscriber));
    }

    function test_CanAccessPost_TierGated_RequiresCorrectTier() public {
        // Create premium tier-gated post (tier 1)
        vm.prank(creator1);
        contentPost.createPost(
            CONTENT_CID,
            PREVIEW_CID,
            CAPTION,
            ContentPost.ContentType.VIDEO,
            ContentPost.AccessLevel.TIER_GATED,
            1 // Premium tier required
        );

        // subscriber1 is on basic tier (0), should not have access
        assertFalse(contentPost.canAccessPost(0, subscriber1));

        // Subscribe subscriber2 to premium tier
        vm.prank(subscriber2);
        creatorProfile.subscribe{ value: TIER_PRICE * 2 }(creator1, 1);

        // subscriber2 on premium tier should have access
        assertTrue(contentPost.canAccessPost(0, subscriber2));
    }

    function test_GetContentCID_HiddenIfNoAccess() public {
        _createSubscriberPost(creator1);

        // Subscriber can see content
        vm.prank(subscriber1);
        string memory cid = contentPost.getContentCID(0);
        assertEq(cid, CONTENT_CID);

        // Non-subscriber gets empty string
        vm.prank(nonSubscriber);
        cid = contentPost.getContentCID(0);
        assertEq(cid, "");
    }

    function test_GetPost_HidesContentCIDIfNoAccess() public {
        _createSubscriberPost(creator1);

        // Non-subscriber sees empty contentCID
        vm.prank(nonSubscriber);
        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.contentCID, "");
        assertEq(post.previewCID, PREVIEW_CID); // Preview still visible
    }

    // ============ Like Tests ============

    function test_LikePost_Success() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        vm.expectEmit(true, true, false, false);
        emit PostLiked(0, subscriber1);
        contentPost.likePost(0);

        assertTrue(contentPost.hasLiked(0, subscriber1));
        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.likesCount, 1);
    }

    function test_LikePost_RevertsIfAlreadyLiked() public {
        _createPublicPost(creator1);

        vm.startPrank(subscriber1);
        contentPost.likePost(0);

        vm.expectRevert(ContentPost.AlreadyLiked.selector);
        contentPost.likePost(0);
        vm.stopPrank();
    }

    function test_LikePost_RevertsIfNoAccess() public {
        _createSubscriberPost(creator1);

        vm.prank(nonSubscriber);
        vm.expectRevert(ContentPost.AccessDenied.selector);
        contentPost.likePost(0);
    }

    function test_UnlikePost_Success() public {
        _createPublicPost(creator1);

        vm.startPrank(subscriber1);
        contentPost.likePost(0);
        contentPost.unlikePost(0);
        vm.stopPrank();

        assertFalse(contentPost.hasLiked(0, subscriber1));
        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.likesCount, 0);
    }

    function test_UnlikePost_RevertsIfNotLiked() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        vm.expectRevert(ContentPost.NotLiked.selector);
        contentPost.unlikePost(0);
    }

    // ============ Comment Tests ============

    function test_AddComment_Success() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        vm.expectEmit(true, true, true, false);
        emit CommentAdded(0, 0, subscriber1);
        contentPost.addComment(0, "Great post!");

        ContentPost.Comment[] memory comments = contentPost.getPostComments(0, 0, 10);
        assertEq(comments.length, 1);
        assertEq(comments[0].content, "Great post!");
        assertEq(comments[0].commenter, subscriber1);

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.commentsCount, 1);
    }

    function test_AddComment_RevertsIfNoAccess() public {
        _createSubscriberPost(creator1);

        vm.prank(nonSubscriber);
        vm.expectRevert(ContentPost.AccessDenied.selector);
        contentPost.addComment(0, "Can't comment!");
    }

    function test_AddComment_RevertsIfEmptyContent() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        vm.expectRevert(ContentPost.InvalidContent.selector);
        contentPost.addComment(0, "");
    }

    function test_DeleteComment_ByCommenter_Success() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        contentPost.addComment(0, "My comment");

        vm.prank(subscriber1);
        contentPost.deleteComment(0);

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.commentsCount, 0);
    }

    function test_DeleteComment_ByPostOwner_Success() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        contentPost.addComment(0, "Some comment");

        // Post owner (creator1) can delete any comment
        vm.prank(creator1);
        contentPost.deleteComment(0);

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.commentsCount, 0);
    }

    function test_DeleteComment_RevertsIfNotOwner() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        contentPost.addComment(0, "Some comment");

        // subscriber2 cannot delete subscriber1's comment
        vm.prank(subscriber2);
        vm.expectRevert(ContentPost.NotCommentOwner.selector);
        contentPost.deleteComment(0);
    }

    // ============ Post Management Tests ============

    function test_UpdatePost_Success() public {
        _createPublicPost(creator1);

        vm.prank(creator1);
        contentPost.updatePost(0, "Updated caption", "QmNewPreview");

        ContentPost.Post memory post = contentPost.getPost(0);
        assertEq(post.caption, "Updated caption");
        assertEq(post.previewCID, "QmNewPreview");
    }

    function test_UpdatePost_RevertsIfNotOwner() public {
        _createPublicPost(creator1);

        vm.prank(subscriber1);
        vm.expectRevert(ContentPost.NotPostOwner.selector);
        contentPost.updatePost(0, "Hacked!", "QmHacked");
    }

    function test_DeletePost_Success() public {
        _createPublicPost(creator1);

        vm.prank(creator1);
        contentPost.deletePost(0);

        vm.expectRevert(ContentPost.PostNotFound.selector);
        contentPost.getPost(0);
    }

    // ============ View Function Tests ============

    function test_GetCreatorPosts_Pagination() public {
        // Create 5 posts
        vm.startPrank(creator1);
        for (uint256 i = 0; i < 5; i++) {
            contentPost.createPost(
                string.concat("QmContent", vm.toString(i)),
                PREVIEW_CID,
                string.concat("Post ", vm.toString(i)),
                ContentPost.ContentType.IMAGE,
                ContentPost.AccessLevel.PUBLIC,
                0
            );
        }
        vm.stopPrank();

        // Get first 3
        ContentPost.Post[] memory batch1 = contentPost.getCreatorPosts(creator1, 0, 3);
        assertEq(batch1.length, 3);
        assertEq(batch1[0].id, 0);
        assertEq(batch1[2].id, 2);

        // Get next 2
        ContentPost.Post[] memory batch2 = contentPost.getCreatorPosts(creator1, 3, 3);
        assertEq(batch2.length, 2);
    }

    function test_GetCreatorPostCount() public {
        _createPublicPost(creator1);
        _createPublicPost(creator1);

        assertEq(contentPost.getCreatorPostCount(creator1), 2);
    }

    function test_GetUserLikedPosts() public {
        _createPublicPost(creator1);
        _createPublicPost(creator1);

        vm.startPrank(subscriber1);
        contentPost.likePost(0);
        contentPost.likePost(1);
        vm.stopPrank();

        uint256[] memory liked = contentPost.getUserLikedPosts(subscriber1);
        assertEq(liked.length, 2);
        assertEq(liked[0], 0);
        assertEq(liked[1], 1);
    }

    // ============ Admin Tests ============

    function test_Pause_BlocksPostCreation() public {
        contentPost.pause();

        vm.prank(creator1);
        vm.expectRevert();
        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, 0
        );
    }

    // ============ Helper Functions ============

    function _createPublicPost(address _creator) internal {
        vm.prank(_creator);
        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.PUBLIC, 0
        );
    }

    function _createSubscriberPost(address _creator) internal {
        vm.prank(_creator);
        contentPost.createPost(
            CONTENT_CID, PREVIEW_CID, CAPTION, ContentPost.ContentType.IMAGE, ContentPost.AccessLevel.SUBSCRIBERS, 0
        );
    }
}
