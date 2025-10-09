// src/components/CommentsSection.jsx
import { useState, useEffect, useCallback } from 'react'; // ADD useCallback
import EmojiPicker from './EmojiPicker';
import { contentModerator } from '../utils/contentModeration.ts';
import { useCommentUpdates } from '../hooks/useCommentUpdates.ts'; // ADD THIS IMPORT

import { useAuth } from '../context/AuthContext'; // <-- add this

export default function CommentsSection({ recipeId }) {
	const { user, loading } = useAuth();
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [replyingTo, setReplyingTo] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isCollapsed, setIsCollapsed] = useState(true);

	// Fetch comments
	useEffect(() => {
		if (!recipeId) return;
		fetchComments();
	}, [recipeId]);

	// Add this useEffect to your component
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('.comment-menu')) {
				const menus = document.querySelectorAll('.comment-menu-dropdown');
				menus.forEach((menu) => (menu.style.display = 'none'));
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	//  Real-time updates handlers
	const handleNewComment = useCallback((newComment) => {
		// <-- add this
		setComments((prev) => {
			const exists = prev.some((c) => c._id === newComment._id);
			if (exists) return prev;
			const filtered = prev.filter(
				(c) => !c.isOptimistic || c.content !== newComment.content
			);
			return [newComment, ...filtered];
		});
	}, []);

	const handleCommentUpdate = useCallback((updatedComment) => {
		// <-- add this
		setComments((prev) =>
			prev.map((c) => (c._id === updatedComment._id ? updatedComment : c))
		);
	}, []);

	// Add these functions inside your CommentsSection component
	const handleEdit = (comment) => {
		// TODO: Implement edit functionality
		console.log('Edit comment:', comment);
	};

	const handleDelete = async (comment) => {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		try {
			const response = await fetch(`/api/delete-comment`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					commentId: comment._id,
					userId: user._id,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setComments((prev) => prev.filter((c) => c._id !== comment._id));
			} else {
				throw new Error(data.error);
			}
		} catch (err) {
			console.error('Error deleting comment:', err);
			alert('Failed to delete comment');
		}
	};

	// Use the real-time hook
	useCommentUpdates(recipeId, handleNewComment, handleCommentUpdate);

	const fetchComments = async () => {
		try {
			const response = await fetch(`/api/get-comments?recipeId=${recipeId}`);
			const data = await response.json();
			if (data.success) {
				setComments(data.comments);
			}
		} catch (err) {
			console.error('Error fetching comments:', err);
		}
	};

	const handleSubmitComment = async (e) => {
		e.preventDefault();

		console.log('Submitting comment:', { newComment, replyingTo });
		console.log('User info:', user);
		console.log('Recipe ID:', recipeId);
		if (!user) {
			setError('Please login to comment');
			return;
		}

		if (!user?._id || !recipeId) {
			setError('Missing required user or recipe information.');
			return;
		}

		const trimmedComment = newComment.trim();
		if (!trimmedComment) return;

		const validation = contentModerator.validateComment(trimmedComment);
		if (!validation.isValid) {
			setError(validation.errors[0]);
			return;
		}

		setIsLoading(true);
		setError('');

		// Optimistic update - show comment immediately
		const tempComment = {
			_id: `temp-${Date.now()}`,
			content: newComment,
			author: {
				_id: user._id,
				name: user.name || '',
				lastname: user.lastname || '',
				email: user.email || '',
				image: user.photoURL,
			},
			publishedAt: new Date().toISOString(),
			isApproved: true, // Assume it will be approved
			isOptimistic: true, // Flag for optimistic update
		};

		setComments((prev) => [tempComment, ...prev]);
		setReplyingTo(null);

		try {
			const response = await fetch('/api/submit-comment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newComment,
					recipeId,
					parentCommentId: replyingTo,
					userId: user._id,
				}),
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error);
			}

			setNewComment('');

			// The real comment will be added via real-time update
		} catch (err) {
			// Rollback optimistic update on error
			setComments((prev) =>
				prev.filter((comment) => comment._id !== tempComment._id)
			);
			setError('Failed to post comment. Please try again.');
			// Restore the comment text if it failed
			setNewComment(tempComment.content);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmojiSelect = (emoji) => {
		setNewComment((prev) => prev + emoji);
	};

	// Show loading state while auth is loading
	if (loading) {
		return (
			<div className='comments-loading'>
				<div className='loading-pulse'>
					<div className='loading-line'></div>
					<div className='loading-box'></div>
					<div className='loading-line short'></div>
				</div>
			</div>
		);
	}

	const isToday = (dateStr) => {
		const commentDate = new Date(dateStr);
		const today = new Date();
		return (
			commentDate.getFullYear() === today.getFullYear() &&
			commentDate.getMonth() === today.getMonth() &&
			commentDate.getDate() === today.getDate()
		);
	};

	// Responsive comment rendering function
	const renderComments = (commentList, depth = 0) => {
		const maxMobileDepth = 2;
		const effectiveDepth = depth > maxMobileDepth ? maxMobileDepth : depth;

		return commentList.map((comment) => {
			const canEdit =
				user?._id === comment.author?._id && isToday(comment.publishedAt);
			const canDelete = user?._id === comment.author?._id;

			return (
				<div
					key={comment._id}
					className={`comment-thread ${effectiveDepth > 0 ? 'nested' : ''}`}
					style={{
						marginLeft:
							effectiveDepth > 0
								? `clamp(0.5rem, ${effectiveDepth * 0.5}rem, 2rem)`
								: '0',
					}}
				>
					<div className='comment-card'>
						<div className='comment-header'>
							<div className='comment-author'>
								<img
									src={comment.author?.image || '/default-avatar.png'}
									alt={comment.author?.name}
									className='comment-avatar'
								/>
								<span className='comment-author-name'>
									{console.log(comment.author)}
									{comment.author?.name}{' '}
									{comment.author?.lastname ||
										comment.author?.displayName ||
										'Anonymous'}
								</span>
							</div>
							<span className='comment-date'>
								{new Date(comment.publishedAt).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</div>

						<div className='comment-content-wrapper'>
							<p className='comment-content'>{comment.content}</p>

							{(canEdit || canDelete) && (
								<div className='comment-menu'>
									<button
										className='comment-menu-toggle'
										onClick={(e) => {
											e.stopPropagation();
											// Toggle menu visibility
											const menus = document.querySelectorAll(
												'.comment-menu-dropdown'
											);
											menus.forEach((menu) => (menu.style.display = 'none'));
											e.currentTarget.nextElementSibling.style.display =
												e.currentTarget.nextElementSibling.style.display ===
												'block'
													? 'none'
													: 'block';
										}}
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

									<div className='comment-menu-dropdown'>
										{canEdit && (
											<button
												onClick={() => handleEdit(comment)}
												className='comment-menu-item comment-menu-edit'
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
												onClick={() => handleDelete(comment)}
												className='comment-menu-item comment-menu-delete'
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
								</div>
							)}
						</div>

						<div className='comment-actions'>
							<div className='comment-buttons'>
								{user && (
									<button
										onClick={() =>
											setReplyingTo(
												replyingTo === comment._id ? null : comment._id
											)
										}
										className='comment-reply-btn'
									>
										Reply
									</button>
								)}

								{comment.isApproved === false && (
									<span className='comment-moderation'>
										Awaiting moderation
									</span>
								)}
							</div>

							{comment.replies && comment.replies.length > 0 && (
								<span className='comment-replies-count'>
									{comment.replies.length}{' '}
									{comment.replies.length === 1 ? 'reply' : 'replies'}
								</span>
							)}
						</div>

						{/* Reply form and nested comments remain unchanged */}
						{replyingTo === comment._id && (
							<form onSubmit={handleSubmitComment} className='reply-form'>
								{/* ... reply form code ... */}
							</form>
						)}

						{comment.replies && comment.replies.length > 0 && depth < 3 && (
							<div className='nested-comments'>
								{renderComments(comment.replies, depth + 1)}
							</div>
						)}
					</div>
				</div>
			);
		});
	};

	return (
		<div className='comments-section'>
			{/* Collapsible Header */}
			<div className='comments-header'>
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className='comments-toggle'
				>
					<div className='comments-title-group'>
						<h2 className='comments-title'>Comments ({comments.length})</h2>
						<span className='comments-count-badge'>{comments.length}</span>
					</div>
					<svg
						className={`comments-toggle-icon ${
							isCollapsed ? 'collapsed' : 'expanded'
						}`}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</button>
			</div>

			{/* Expandable Content */}
			{!isCollapsed && (
				<div className='comments-content'>
					{/* Comment Form */}
					{user ? (
						<form onSubmit={handleSubmitComment} className='comment-form'>
							<div className='comment-form-card'>
								<div className='comment-form-layout'>
									<img
										src={user.photoURL || '/default-avatar.png'}
										alt={user.displayName}
										className='comment-form-avatar'
									/>

									<div className='comment-form-main'>
										<textarea
											value={newComment}
											onChange={(e) => setNewComment(e.target.value)}
											placeholder='Share your thoughts about this recipe...'
											className='comment-form-textarea'
											rows='3'
											maxLength='1000'
										/>

										<div className='comment-form-controls'>
											<div className='comment-form-left'>
												<EmojiPicker onEmojiSelect={handleEmojiSelect} />
												<span
													className={`character-count ${
														newComment.length > 900 ? 'warning' : ''
													}`}
												>
													{newComment.length}/1000
												</span>
											</div>

											<div className='comment-form-right'>
												<button
													type='submit'
													disabled={isLoading || !newComment.trim()}
													className='submit-comment-btn'
												>
													{isLoading ? (
														<span className='submit-loading'>
															<svg
																className='loading-spinner'
																fill='none'
																viewBox='0 0 24 24'
															>
																<circle
																	className='spinner-circle'
																	cx='12'
																	cy='12'
																	r='10'
																	stroke='currentColor'
																	strokeWidth='4'
																/>
																<path
																	className='spinner-path'
																	fill='currentColor'
																	d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
																/>
															</svg>
															Posting
														</span>
													) : (
														'Post Comment'
													)}
												</button>
											</div>
										</div>

										{error && <div className='comment-error'>{error}</div>}
									</div>
								</div>
							</div>
						</form>
					) : (
						<div className='comments-login-prompt'>
							<p className='login-prompt-text'>
								Please log in to join the conversation
							</p>
							<button
								onClick={() =>
									document.querySelector('login-modal')?.showModal()
								}
								className='login-comment-btn'
							>
								Log In to Comment
							</button>
						</div>
					)}

					{/* Comments List */}
					<div className='comments-list'>
						{console.log(comments)}
						{comments.length > 0 ? (
							renderComments(comments)
						) : (
							<div className='no-comments'>
								<div className='no-comments-icon'>
									<svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={1}
											d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
										/>
									</svg>
								</div>
								<p className='no-comments-text'>
									No comments yet. Be the first to share your thoughts!
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			<style>{`
				.comments-section {
					width: 100%;
					max-width: 100%;
					margin: 2rem 0;
				}

				.comments-header {
					border-bottom: 2px solid #f3d3c4;
					padding-bottom: 1rem;
					margin-bottom: 1.5rem;
				}

				.comments-toggle {
					display: flex;
					align-items: center;
					justify-content: space-between;
					width: 100%;
					background: none;
					border: none;
					cursor: pointer;
					padding: 0.5rem;
					border-radius: 0.5rem;
					transition: background-color 0.2s ease;
				}

				.comments-toggle:hover {
					background-color: #fff7f4;
				}

				.comments-title-group {
					display: flex;
					align-items: center;
					gap: 1rem;
				}

				.comments-title {
					font-family: var(--font-heading);
					font-size: 1.6rem;
					font-weight: 700;
					color: var(--color-primary);
					margin: 0;
				}

				.comments-count-badge {
					background: var(--color-secondary);
					color: white;
					padding: 0.25rem 0.75rem;
					border-radius: 9999px;
					font-size: 0.875rem;
					font-weight: 600;
				}

				.comments-toggle-icon {
					width: 1.25rem;
					height: 1.25rem;
					color: #6b7280;
					transition: transform 0.2s ease;
				}

				.comments-toggle-icon.expanded {
					transform: rotate(180deg);
				}

				.comments-content {
					margin-top: 1rem;
				}

				/* Comment Form Styles */
				.comment-form-card {
					background: #fff7f4;
					border-radius: var(--border-radius);
					box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
					padding: var(--spacing-medium);
					margin-bottom: 2rem;
					border: 1px solid #f5c6c6;
				}

				.comment-form-layout {
					display: flex;
					gap: 1rem;
					align-items: flex-start;
				}

				.comment-form-avatar {
					width: 3rem;
					height: 3rem;
					border-radius: 50%;
					flex-shrink: 0;
				}

				.comment-form-main {
					flex: 1;
					min-width: 0;
				}

				.comment-form-textarea {
					width: 100%;
					padding: 0.75rem;
					border: 1px solid #f5c6c6;
					border-radius: 0.5rem;
					background: white;
					font-family: inherit;
					font-size: 1rem;
					line-height: 1.5;
					resize: vertical;
					transition: border-color 0.2s ease;
				}

				.comment-form-textarea:focus {
					outline: none;
					border-color: var(--color-primary);
					box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.1);
				}

				.comment-form-controls {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: 1rem;
					gap: 1rem;
				}

				.comment-form-left {
					display: flex;
					align-items: center;
					gap: 1rem;
				}

				.character-count {
					font-size: 0.875rem;
					color: #6b7280;
				}

				.character-count.warning {
					color: #dc2626;
				}

				.submit-comment-btn {
					background: var(--color-primary);
					color: white;
					border: none;
					border-radius: 0.5rem;
					padding: 0.75rem 1.5rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.2s ease;
					min-width: 120px;
				}

				.submit-comment-btn:hover:not(:disabled) {
					background: var(--color-secondary);
					transform: translateY(-1px);
				}

				.submit-comment-btn:disabled {
					opacity: 0.6;
					cursor: not-allowed;
					transform: none;
				}

				.submit-loading {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.loading-spinner {
					width: 1rem;
					height: 1rem;
					animation: spin 1s linear infinite;
				}

				.spinner-circle {
					opacity: 0.25;
				}

				.spinner-path {
					opacity: 0.75;
				}

				.comment-error {
					background: #fef2f2;
					border: 1px solid #fecaca;
					color: #dc2626;
					padding: 0.75rem;
					border-radius: 0.5rem;
					margin-top: 1rem;
					font-size: 0.875rem;
				}

				/* Login Prompt */
				.comments-login-prompt {
					background: #fef0eb;
					border-radius: var(--border-radius);
					padding: 2rem;
					text-align: center;
					margin-bottom: 2rem;
					border: 1px solid #f5c6c6;
				}

				.login-prompt-text {
					color: var(--color-dark);
					margin-bottom: 1rem;
					font-size: 1rem;
				}

				.login-comment-btn {
					background: var(--color-primary);
					color: white;
					border: none;
					border-radius: 0.5rem;
					padding: 0.75rem 1.5rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.2s ease;
				}

				.login-comment-btn:hover {
					background: var(--color-secondary);
					transform: translateY(-1px);
				}

				/* Comments List */
				.comments-list {
					space-y: 1rem;
				}

				.comment-thread {
					margin-bottom: 1rem;
				}

				.comment-thread.nested {
					border-left: 2px solid #f3d3c4;
					padding-left: 1rem;
					margin-left: 1rem;
				}

				.comment-card {
					background: white;
					border-radius: var(--border-radius);
					padding: 1rem 1.25rem;
					box-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
					border: 1px solid #f5c6c6;
					transition: background 0.2s ease;
				}

				.comment-card:hover {
				background: #fff7f4;
				}

				.comment-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 0.75rem;
					gap: 1rem;
				}

				.comment-author {
					display: flex;
					align-items: center;
					gap: 0.75rem;
					min-width: 0;
				}

				.comment-avatar {
					width: 2.5rem;
					height: 2.5rem;
					border-radius: 50%;
					object-fit: cover;
				}

				.comment-author-name {
					font-weight: 700;
					color: var(--color-primary);
					font-size: 1.2rem;
				}

				.comment-date {
					color: #6b7280;
					font-size: 0.75rem;
					flex-shrink: 0;
				}

				.comment-content {

					margin: 0.5rem 2.75rem;
					font-size: 0.95rem;
					line-height: 1.5;
					white-space: pre-wrap;
					color: var(--color-dark);

				}

				.comment-actions {
					display: flex;
					justify-content: space-between;
					align-items: center;
					gap: 1rem;
					font-size: 0.85rem;
					color: #6b7280;
				}

				.comment-content-wrapper {
  position: relative;
  margin-left: 3.25rem; /* This indents the content under the author */
  margin-top: 0.25rem;
}

.comment-content {
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--color-dark);
  margin: 0;
  padding-right: 2rem; /* Space for the menu button */
}

.comment-menu {
  position: absolute;
  top: 0;
  right: 0;
}

.comment-menu-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  color: #6b7280;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.comment-menu-toggle:hover {
  background: #f3f4f6;
  color: var(--color-dark);
  opacity: 1;
}

.comment-menu-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  z-index: 10;
  min-width: 120px;
}

.comment-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  text-align: left;
}

.comment-menu-edit {
  color: #4b5563;
}

.comment-menu-edit:hover {
  background: #f3f4f6;
  color: var(--color-primary);
}

.comment-menu-delete {
  color: #4b5563;
}

.comment-menu-delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Remove the old inline action styles */
.comment-content-with-actions,
.comment-actions-inline {
  display: none;
}

				.comment-thread.nested {
				position: relative;
				margin-left: 2rem;
				}

				.comment-thread.nested::before {
				content: '';
				position: absolute;
				left: -1rem;
				top: 0.5rem;
				width: 2px;
				height: calc(100% - 0.5rem);
				background: #f3d3c4;
				border-radius: 1px;
				}

				.comment-replies-count {
				font-size: 0.8rem;
				color: #9ca3af;
				}

				.comment-buttons {
					display: flex;
					align-items: center;
					gap: 1rem;
				}

				.comment-reply-btn {
					background: none;
					border: none;
					color: var(--color-primary);
					font-weight: 600;
					cursor: pointer;
					padding: 0.5rem;
					border-radius: 0.25rem;
					transition: all 0.2s ease;
				}

				.comment-reply-btn:hover {
					background: #fff7f4;
					color: var(--color-secondary);
				}

				.comment-moderation {
					color: #ea580c;
					font-size: 0.875rem;
					display: flex;
					align-items: center;
					gap: 0.25rem;
				}

				.comment-replies-count {
					color: #6b7280;
					font-size: 0.875rem;
				}

				/* Reply Form */
				.reply-form {
					margin-top: 1rem;
				}

				.reply-input-group {
					display: flex;
					flex-direction: column;
					gap: 1rem;
				}

				@media (min-width: 640px) {
					.reply-input-group {
						flex-direction: row;
						align-items: flex-end;
					}
				}

				.reply-textarea-wrapper {
					flex: 1;
					position: relative;
				}

				.reply-textarea {
					width: 100%;
					padding: 0.75rem;
					border: 1px solid #f5c6c6;
					border-radius: 0.5rem;
					background: white;
					font-family: inherit;
					font-size: 0.875rem;
					line-height: 1.5;
					resize: vertical;
					transition: border-color 0.2s ease;
				}

				.reply-textarea:focus {
					outline: none;
					border-color: var(--color-primary);
					box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.1);
				}

				.emoji-picker-wrapper {
					position: absolute;
					right: 0.5rem;
					bottom: 0.5rem;
				}

				.reply-buttons {
					display: flex;
					gap: 0.5rem;
				}

				@media (min-width: 640px) {
					.reply-buttons {
						flex-direction: column;
					}
				}

				.submit-reply-btn,
				.cancel-reply-btn {
					padding: 0.5rem 1rem;
					border: none;
					border-radius: 0.5rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.2s ease;
					font-size: 0.875rem;
					flex: 1;
				}

				.submit-reply-btn {
					background: var(--color-primary);
					color: white;
				}

				.submit-reply-btn:hover:not(:disabled) {
					background: var(--color-secondary);
				}

				.submit-reply-btn:disabled {
					opacity: 0.6;
					cursor: not-allowed;
				}

				.cancel-reply-btn {
					background: #6b7280;
					color: white;
				}

				.cancel-reply-btn:hover {
					background: #4b5563;
				}

				.nested-comments {
					margin-top: 1rem;
				}

				/* No Comments */
				.no-comments {
					text-align: center;
					padding: 3rem 1rem;
					color: #6b7280;
				}

				.no-comments-icon {
					width: 3rem;
					height: 3rem;
					margin: 0 auto 1rem;
					color: #d1d5db;
				}

				.no-comments-text {
					font-size: 1rem;
					margin: 0;
				}

				/* Loading */
				.comments-loading {
					padding: 2rem;
				}

				.loading-pulse {
					space-y: 1rem;
				}

				.loading-line {
					height: 1rem;
					background: #f3f4f6;
					border-radius: 0.5rem;
					animation: pulse 2s infinite;
				}

				.loading-line.short {
					width: 50%;
				}

				.loading-box {
					height: 4rem;
					background: #f3f4f6;
					border-radius: 0.5rem;
					animation: pulse 2s infinite;
				}

				.comment-edit-btn,
				.comment-delete-btn {
		
				font-weight: 600;
				cursor: pointer;
				padding: 0.25rem 0.5rem;
				border-radius: 0.25rem;
				transition: background-color 0.2s ease, color 0.2s ease;
				font-size: 0.875rem;
				}

				.comment-edit-btn {
				background-color: #fe862b;
				color: #fff7f4;
				}

				.comment-delete-btn {
				background-color: #fc0101;
				color: #fff7f4;
				}

				.comment-edit-btn:hover {
				background-color: #fff7f4;
				color: var(--color-secondary);
				}

				.comment-delete-btn:hover {
				background-color: #fee2e2;
				color: #dc2626;
				}

				@keyframes pulse {
					0%,
					100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}

				@keyframes spin {
					to {
						transform: rotate(360deg);
					}
				}

				/* Responsive */
				@media (max-width: 640px) {
					.comment-header {
						flex-direction: column;
						align-items: flex-start;
						gap: 0.5rem;
					}

					.comment-form-layout {
						flex-direction: column;
					}

					.comment-form-avatar {
						align-self: flex-start;
					}

					.comment-form-controls {
						flex-direction: column;
						align-items: stretch;
						gap: 1rem;
					}

					.comment-form-left {
						justify-content: space-between;
					}
				}
			`}</style>
		</div>
	);
}
