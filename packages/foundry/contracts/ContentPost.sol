// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./CreatorProfile.sol";

/**
 * @title ContentPost
 * @author FansOnly Team
 * @notice Contract for managing creator content posts with tier-based access control
 * @dev Integrates with CreatorProfile for subscription verification
 */
contract ContentPost is Ownable, ReentrancyGuard, Pausable {
    // ============ Constants ============
    uint256 public constant MAX_CONTENT_PER_POST = 10; // Max media items per post

    // ============ Enums ============
    enum ContentType {
        TEXT,
        IMAGE,
        VIDEO,
        AUDIO,
        MIXED
    }

    enum AccessLevel {
        PUBLIC, // Anyone can view
        SUBSCRIBERS, // Any subscriber can view
        TIER_GATED // Specific tier required
    }

    // ============ Structs ============
    struct Post {
        uint256 id;
        address creator;
        string contentCID; // IPFS CID for encrypted content
        string caption;
        ContentType contentType;
        AccessLevel accessLevel;
        uint256 requiredTierId; // Only used if accessLevel is TIER_GATED
        uint256 createdAt;
        uint256 likesCount;
        uint256 commentsCount;
        bool isActive;
    }

    struct Comment {
        uint256 id;
        uint256 postId;
        address commenter;
        string content;
        uint256 createdAt;
        bool isActive;
    }

    // ============ State Variables ============
    CreatorProfile public immutable creatorProfile;

    uint256 public nextPostId;
    uint256 public nextCommentId;

    mapping(uint256 => Post) public posts;
    mapping(address => uint256[]) public creatorPosts; // creator => postIds
    mapping(uint256 => uint256[]) public postComments; // postId => commentIds
    mapping(uint256 => Comment) public comments;
    mapping(uint256 => mapping(address => bool)) public postLikes; // postId => user => liked
    mapping(address => uint256[]) public userLikedPosts; // user => likedPostIds

    // ============ Events ============
    event PostCreated(
        uint256 indexed postId,
        address indexed creator,
        ContentType contentType,
        AccessLevel accessLevel,
        uint256 timestamp
    );
    event PostUpdated(uint256 indexed postId, address indexed creator);
    event PostDeleted(uint256 indexed postId, address indexed creator);
    event PostLiked(uint256 indexed postId, address indexed user);
    event PostUnliked(uint256 indexed postId, address indexed user);
    event CommentAdded(uint256 indexed postId, uint256 indexed commentId, address indexed commenter);
    event CommentDeleted(uint256 indexed postId, uint256 indexed commentId);

    // ============ Errors ============
    error NotACreator();
    error PostNotFound();
    error NotPostOwner();
    error CommentNotFound();
    error NotCommentOwner();
    error AccessDenied();
    error InvalidContent();
    error AlreadyLiked();
    error NotLiked();
    error InvalidTier();

    // ============ Modifiers ============
    modifier onlyCreator() {
        if (!creatorProfile.isCreator(msg.sender)) revert NotACreator();
        _;
    }

    modifier postExists(uint256 _postId) {
        if (_postId >= nextPostId || !posts[_postId].isActive) revert PostNotFound();
        _;
    }

    modifier onlyPostOwner(uint256 _postId) {
        if (posts[_postId].creator != msg.sender) revert NotPostOwner();
        _;
    }

    // ============ Constructor ============
    constructor(address _creatorProfile) Ownable(msg.sender) {
        creatorProfile = CreatorProfile(_creatorProfile);
    }

    // ============ Post Management ============

    /**
     * @notice Create a new post
     * @param _contentCID IPFS CID for the encrypted content
     * @param _caption Post caption
     * @param _contentType Type of content
     * @param _accessLevel Access level for the post
     * @param _requiredTierId Required tier ID if tier-gated
     */
    function createPost(
        string calldata _contentCID,
        string calldata _caption,
        ContentType _contentType,
        AccessLevel _accessLevel,
        uint256 _requiredTierId
    ) external onlyCreator whenNotPaused {
        if (bytes(_contentCID).length == 0) revert InvalidContent();

        // Validate tier if tier-gated
        if (_accessLevel == AccessLevel.TIER_GATED) {
            CreatorProfile.SubscriptionTier[] memory tiers = creatorProfile.getCreatorTiers(msg.sender);
            if (_requiredTierId >= tiers.length) revert InvalidTier();
        }

        uint256 postId = nextPostId++;

        posts[postId] = Post({
            id: postId,
            creator: msg.sender,
            contentCID: _contentCID,
            caption: _caption,
            contentType: _contentType,
            accessLevel: _accessLevel,
            requiredTierId: _requiredTierId,
            createdAt: block.timestamp,
            likesCount: 0,
            commentsCount: 0,
            isActive: true
        });

        creatorPosts[msg.sender].push(postId);

        emit PostCreated(postId, msg.sender, _contentType, _accessLevel, block.timestamp);
    }

    /**
     * @notice Update a post's caption
     * @param _postId Post ID to update
     * @param _caption New caption
     */
    function updatePost(uint256 _postId, string calldata _caption)
        external
        postExists(_postId)
        onlyPostOwner(_postId)
        whenNotPaused
    {
        Post storage post = posts[_postId];
        post.caption = _caption;

        emit PostUpdated(_postId, msg.sender);
    }

    /**
     * @notice Delete a post (soft delete)
     * @param _postId Post ID to delete
     */
    function deletePost(uint256 _postId) external postExists(_postId) onlyPostOwner(_postId) {
        posts[_postId].isActive = false;
        emit PostDeleted(_postId, msg.sender);
    }

    // ============ Interactions ============

    /**
     * @notice Like a post
     * @param _postId Post ID to like
     */
    function likePost(uint256 _postId) external postExists(_postId) whenNotPaused {
        if (postLikes[_postId][msg.sender]) revert AlreadyLiked();

        // Check access before allowing like
        if (!canAccessPost(_postId, msg.sender)) revert AccessDenied();

        postLikes[_postId][msg.sender] = true;
        posts[_postId].likesCount++;
        userLikedPosts[msg.sender].push(_postId);

        emit PostLiked(_postId, msg.sender);
    }

    /**
     * @notice Unlike a post
     * @param _postId Post ID to unlike
     */
    function unlikePost(uint256 _postId) external postExists(_postId) whenNotPaused {
        if (!postLikes[_postId][msg.sender]) revert NotLiked();

        postLikes[_postId][msg.sender] = false;
        posts[_postId].likesCount--;

        // Remove from userLikedPosts (gas expensive, but maintains data integrity)
        uint256[] storage liked = userLikedPosts[msg.sender];
        for (uint256 i = 0; i < liked.length; i++) {
            if (liked[i] == _postId) {
                liked[i] = liked[liked.length - 1];
                liked.pop();
                break;
            }
        }

        emit PostUnliked(_postId, msg.sender);
    }

    /**
     * @notice Add a comment to a post
     * @param _postId Post ID to comment on
     * @param _content Comment content
     */
    function addComment(uint256 _postId, string calldata _content) external postExists(_postId) whenNotPaused {
        if (bytes(_content).length == 0) revert InvalidContent();
        if (!canAccessPost(_postId, msg.sender)) revert AccessDenied();

        uint256 commentId = nextCommentId++;

        comments[commentId] = Comment({
            id: commentId,
            postId: _postId,
            commenter: msg.sender,
            content: _content,
            createdAt: block.timestamp,
            isActive: true
        });

        postComments[_postId].push(commentId);
        posts[_postId].commentsCount++;

        emit CommentAdded(_postId, commentId, msg.sender);
    }

    /**
     * @notice Delete a comment (only by commenter or post owner)
     * @param _commentId Comment ID to delete
     */
    function deleteComment(uint256 _commentId) external {
        Comment storage comment = comments[_commentId];
        if (!comment.isActive) revert CommentNotFound();

        Post storage post = posts[comment.postId];
        if (comment.commenter != msg.sender && post.creator != msg.sender) {
            revert NotCommentOwner();
        }

        comment.isActive = false;
        post.commentsCount--;

        emit CommentDeleted(comment.postId, _commentId);
    }

    // ============ Access Control ============

    /**
     * @notice Check if a user can access a post's content
     * @param _postId Post ID to check
     * @param _user User address to check
     * @return bool True if user has access
     */
    function canAccessPost(uint256 _postId, address _user) public view returns (bool) {
        Post storage post = posts[_postId];

        // Creator always has access
        if (post.creator == _user) return true;

        // Public posts are accessible to everyone
        if (post.accessLevel == AccessLevel.PUBLIC) return true;

        // Check subscription for subscriber/tier-gated content
        if (!creatorProfile.isSubscribed(post.creator, _user)) return false;

        // For tier-gated, check specific tier
        if (post.accessLevel == AccessLevel.TIER_GATED) {
            CreatorProfile.Subscription memory sub = creatorProfile.getSubscription(post.creator, _user);
            // User must be at the required tier level or higher
            return sub.tierId >= post.requiredTierId;
        }

        return true;
    }

    /**
     * @notice Get the content CID if user has access
     * @param _postId Post ID
     * @return contentCID The IPFS CID (empty if no access)
     */
    function getContentCID(uint256 _postId) external view postExists(_postId) returns (string memory) {
        if (!canAccessPost(_postId, msg.sender)) return "";
        return posts[_postId].contentCID;
    }

    // ============ View Functions ============

    /**
     * @notice Get a post with access check
     * @param _postId Post ID
     * @return Post struct (contentCID empty if no access)
     */
    function getPost(uint256 _postId) external view postExists(_postId) returns (Post memory) {
        Post memory post = posts[_postId];

        // Hide content CID if no access
        if (!canAccessPost(_postId, msg.sender)) {
            post.contentCID = "";
        }

        return post;
    }

    /**
     * @notice Get all post IDs for a creator
     * @param _creator Creator address
     * @return Array of post IDs
     */
    function getCreatorPostIds(address _creator) external view returns (uint256[] memory) {
        return creatorPosts[_creator];
    }

    /**
     * @notice Get posts for a creator with pagination
     * @param _creator Creator address
     * @param _offset Starting index
     * @param _limit Number of posts to return
     * @return Array of Post structs
     */
    function getCreatorPosts(address _creator, uint256 _offset, uint256 _limit) external view returns (Post[] memory) {
        uint256[] storage postIds = creatorPosts[_creator];
        uint256 total = postIds.length;

        if (_offset >= total) {
            return new Post[](0);
        }

        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }

        Post[] memory result = new Post[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            Post memory post = posts[postIds[i]];
            // Hide content CID if no access
            if (!canAccessPost(postIds[i], msg.sender)) {
                post.contentCID = "";
            }
            result[i - _offset] = post;
        }

        return result;
    }

    /**
     * @notice Get comments for a post
     * @param _postId Post ID
     * @param _offset Starting index
     * @param _limit Number of comments to return
     * @return Array of Comment structs
     */
    function getPostComments(uint256 _postId, uint256 _offset, uint256 _limit)
        external
        view
        postExists(_postId)
        returns (Comment[] memory)
    {
        uint256[] storage commentIds = postComments[_postId];
        uint256 total = commentIds.length;

        if (_offset >= total) {
            return new Comment[](0);
        }

        uint256 end = _offset + _limit;
        if (end > total) {
            end = total;
        }

        Comment[] memory result = new Comment[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = comments[commentIds[i]];
        }

        return result;
    }

    /**
     * @notice Check if user has liked a post
     * @param _postId Post ID
     * @param _user User address
     * @return bool True if liked
     */
    function hasLiked(uint256 _postId, address _user) external view returns (bool) {
        return postLikes[_postId][_user];
    }

    /**
     * @notice Get user's liked post IDs
     * @param _user User address
     * @return Array of post IDs
     */
    function getUserLikedPosts(address _user) external view returns (uint256[] memory) {
        return userLikedPosts[_user];
    }

    /**
     * @notice Get total posts count for a creator
     * @param _creator Creator address
     * @return uint256 Total posts count
     */
    function getCreatorPostCount(address _creator) external view returns (uint256) {
        return creatorPosts[_creator].length;
    }

    // ============ Admin Functions ============

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
