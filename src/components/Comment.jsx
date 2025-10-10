import { useState, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';

const Comment = ({
	comment,
	depth = 0,
	user,
	replyingTo,
	setReplyingTo,
	newComment,
	setNewComment,
	handleSubmitComment,
	isLoading,
	editingComment,
	setEditingComment,
	editContent,
	setEditContent,
	handleSaveEdit,
	handleCancelEdit,
	handleDelete,
	isThreadExpanded,
	toggleThread,
	renderComments,
	isToday,
}) => {
	const [showMenu, setShowMenu] = useState(false);
	const [nestedReplies, setNestedReplies] = useState([]);
	const [loadingNested, setLoadingNested] = useState(false);

	const canEdit =
		user?._id === comment.author?._id && isToday(comment.publishedAt);
	const canDelete = user?._id === comment.author?._id;
	const hasReplies =
		Array.isArray(comment.replies) && comment.replies.length > 0;
	const hasNestedReplies =
		comment.hasNestedReplies || comment.nestedRepliesCount > 0;
	const isThreadView = isThreadExpanded(comment._id);
	const isReplying = replyingTo === comment._id;

	// Load nested replies when thread is expanded
	useEffect(() => {
		if (isThreadView && hasNestedReplies) {
			console.log('🎯 LOADING NESTED REPLIES FOR:', comment._id);
			loadNestedReplies();
		}
	}, [isThreadView]);

	const loadNestedReplies = async () => {
		setLoadingNested(true);
		try {
			console.log(`🔄 Loading nested replies for ${comment._id}`);
			const response = await fetch(
				`/api/get-nested-replies?parentCommentId=${comment._id}`
			);
			const data = await response.json();

			if (data.success) {
				console.log(`✅ Loaded ${data.replies.length} nested replies`);
				setNestedReplies(data.replies);
			}
		} catch (error) {
			console.error('❌ Error loading nested replies:', error);
		} finally {
			setLoadingNested(false);
		}
	};

	const handleMenuToggle = (e) => {
		e.stopPropagation();
		setShowMenu(!showMenu);
	};

	const handleEdit = () => {
		setEditingComment(comment._id);
		setEditContent(comment.content);
		setShowMenu(false);
	};

	// Combine existing replies with lazy-loaded nested replies
	const allReplies = isThreadView
		? [...(comment.replies || []), ...nestedReplies]
		: comment.replies || [];

	// Determine what to show in thread controls
	const getThreadControls = () => {
		// If no replies at all, don't show anything
		if (!hasReplies && !hasNestedReplies) {
			return null;
		}

		// If we're in thread view, show collapse button
		if (isThreadView) {
			return (
				<button
					onClick={() => toggleThread(comment._id)}
					className='view-thread-btn'
				>
					<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
						<path d='M19 13H5v-2h14v2z'></path>
					</svg>
					Collapse Thread ({allReplies.length} replies)
				</button>
			);
		}

		// Show View Thread button if we have any kind of replies
		if (hasReplies || hasNestedReplies) {
			const totalReplies =
				(comment.replies?.length || 0) + (comment.nestedRepliesCount || 0);
			return (
				<button
					onClick={() => {
						console.log(`🎯 Expanding thread for ${comment._id}`);
						toggleThread(comment._id);
					}}
					className='view-thread-btn'
					disabled={loadingNested}
				>
					<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
						<path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'></path>
					</svg>
					{loadingNested
						? 'Loading...'
						: `View Thread (${totalReplies} replies)`}
				</button>
			);
		}

		return null;
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

		if (diffInHours < 1) return 'Just now';
		if (diffInHours < 24) return `${diffInHours}h ago`;
		if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
		return date.toLocaleDateString();
	};

	return (
		<div
			className={`comment-thread ${depth > 0 ? 'nested' : ''} ${
				isThreadView ? 'thread-expanded' : ''
			}`}
		>
			<div className='comment-card'>
				{/* COMMENT HEADER */}
				<div className='comment-header'>
					<div className='comment-author'>
						<img
							src={comment.author?.image || '/default-avatar.png'}
							alt={comment.author?.name}
							className='comment-avatar'
						/>
						<div className='comment-author-info'>
							<span className='comment-author-name'>
								{comment.author?.name} {comment.author?.lastname || 'User'}
							</span>
							<span className='comment-timestamp'>
								{formatDate(comment.publishedAt)}
								{comment.editedAt && ' • Edited'}
							</span>
						</div>
					</div>

					{(canEdit || canDelete) && (
						<div className='comment-menu'>
							<button
								className='comment-menu-toggle'
								onClick={handleMenuToggle}
							>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='currentColor'
								>
									<circle cx='12' cy='6' r='2'></circle>
									<circle cx='12' cy='12' r='2'></circle>
									<circle cx='12' cy='18' r='2'></circle>
								</svg>
							</button>
							{showMenu && (
								<div className='comment-menu-dropdown'>
									{canEdit && (
										<button
											className='comment-menu-item comment-menu-edit'
											onClick={handleEdit}
										>
											<svg
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z' />
											</svg>
											Edit
										</button>
									)}
									{canDelete && (
										<button
											className='comment-menu-item comment-menu-delete'
											onClick={() => handleDelete(comment)}
										>
											<svg
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='currentColor'
											>
												<path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
											</svg>
											Delete
										</button>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* COMMENT CONTENT */}
				<div className='comment-content-wrapper'>
					{editingComment === comment._id ? (
						<div className='comment-edit'>
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className='edit-textarea'
								rows='3'
							/>
							<div className='edit-actions'>
								<button className='cancel-edit' onClick={handleCancelEdit}>
									Cancel
								</button>
								<button
									className='save-edit'
									onClick={() => handleSaveEdit(comment._id)}
									disabled={!editContent.trim()}
								>
									Save
								</button>
							</div>
						</div>
					) : (
						<p className='comment-content'>{comment.content}</p>
					)}
				</div>

				{/* COMMENT ACTIONS */}
				<div className='comment-actions'>
					<div className='comment-buttons'>
						{user && (
							<button
								onClick={() => setReplyingTo(isReplying ? null : comment._id)}
								className='comment-reply-btn'
							>
								Reply
							</button>
						)}
						{comment.isApproved === false && (
							<span className='comment-moderation'>Awaiting moderation</span>
						)}
					</div>

					{comment.replies && comment.replies.length > 0 && (
						<span className='comment-replies-count'>
							{comment.replies.length}{' '}
							{comment.replies.length === 1 ? 'reply' : 'replies'}
						</span>
					)}
				</div>

				{/* REPLY FORM */}
				{isReplying && user && (
					<form onSubmit={handleSubmitComment} className='reply-form'>
						<div className='reply-input-group'>
							<div className='reply-textarea-wrapper'>
								<textarea
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									placeholder='Write your reply...'
									className='reply-textarea'
									rows='3'
								/>
								<div className='emoji-picker-wrapper'>
									<EmojiPicker
										onEmojiSelect={(emoji) =>
											setNewComment((prev) => prev + emoji)
										}
									/>
								</div>
							</div>
							<div className='reply-buttons'>
								<button
									type='submit'
									disabled={isLoading || !newComment.trim()}
									className='submit-reply-btn'
								>
									{isLoading ? 'Posting...' : 'Reply'}
								</button>
								<button
									type='button'
									onClick={() => setReplyingTo(null)}
									className='cancel-reply-btn'
								>
									Cancel
								</button>
							</div>
						</div>
					</form>
				)}

				{/* THREAD CONTROLS */}
				<div className='comment-thread-controls'>{getThreadControls()}</div>

				{/* NESTED COMMENTS */}
				{(hasReplies || nestedReplies.length > 0) && isThreadView && (
					<div className='nested-comments'>
						{loadingNested && (
							<div className='loading-nested'>Loading nested replies...</div>
						)}
						{!loadingNested &&
							allReplies.length > 0 &&
							renderComments(allReplies, depth + 1)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Comment;
