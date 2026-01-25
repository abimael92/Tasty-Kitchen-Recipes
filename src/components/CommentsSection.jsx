import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { contentModerator } from '../utils/contentModeration';
import { useCommentUpdates } from '../hooks/useCommentUpdates.ts';
import EmojiPicker from './EmojiPicker';
import Comment from './Comment';
import './CommentsSection.css';

export default function CommentsSection({ recipeId }) {
	const { user, loading } = useAuth();
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [replyingTo, setReplyingTo] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [editingComment, setEditingComment] = useState(null);
	const [editContent, setEditContent] = useState('');
	const [expandedThreads, setExpandedThreads] = useState(new Set());

	// Fetch comments
	useEffect(() => {
		if (!recipeId) return;
		fetchComments();
	}, [recipeId]);

	// Click outside handler for menus
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

	// Real-time updates handlers
	const handleNewComment = useCallback((newComment) => {
		console.log('🆕 New comment received:', newComment);

		if (newComment.parentCommentId) {
			// This is a reply - add it to the parent comment recursively
			const addReplyToParent = (comments, parentId, newReply) => {
				return comments.map((comment) => {
					if (comment._id === parentId) {
						return {
							...comment,
							replies: [...(comment.replies || []), newReply],
						};
					}

					if (comment.replies && comment.replies.length > 0) {
						return {
							...comment,
							replies: addReplyToParent(comment.replies, parentId, newReply),
						};
					}

					return comment;
				});
			};

			setComments((prev) =>
				addReplyToParent(prev, newComment.parentCommentId, newComment)
			);
		} else {
			// This is a top-level comment
			setComments((prev) => {
				const exists = prev.some((c) => c._id === newComment._id);
				if (exists) return prev;
				const filtered = prev.filter(
					(c) => !c.isOptimistic || c.content !== newComment.content
				);
				return [newComment, ...filtered];
			});
		}
	}, []);

	const handleCommentUpdate = useCallback((updatedComment) => {
		console.log('🔄 Comment updated:', updatedComment);

		// Recursively update comment
		const updateCommentRecursive = (comments, updated) => {
			return comments.map((comment) => {
				if (comment._id === updated._id) {
					return updated;
				}

				if (comment.replies && comment.replies.length > 0) {
					return {
						...comment,
						replies: updateCommentRecursive(comment.replies, updated),
					};
				}

				return comment;
			});
		};

		setComments((prev) => updateCommentRecursive(prev, updatedComment));
	}, []);

	// Thread management functions
	const toggleThread = (commentId) => {
		setExpandedThreads((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(commentId)) {
				newSet.delete(commentId);
			} else {
				newSet.add(commentId);
			}
			return newSet;
		});
	};

	const isThreadExpanded = (commentId) => {
		return expandedThreads.has(commentId);
	};

	// Edit comment functions
	const handleEdit = (comment) => {
		setEditingComment(comment._id);
		setEditContent(comment.content);
		// Close any open menus
		const menus = document.querySelectorAll('.comment-menu-dropdown');
		menus.forEach((menu) => (menu.style.display = 'none'));
	};

	const handleCancelEdit = () => {
		setEditingComment(null);
		setEditContent('');
	};

	const handleSaveEdit = async (commentId) => {
		if (!editContent.trim()) return;

		try {
			const response = await fetch('/api/edit-comment', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					commentId: commentId,
					content: editContent.trim(),
				}),
			});

			const data = await response.json();

			if (data.success) {
				setComments((prev) =>
					prev.map((comment) =>
						comment._id === commentId
							? {
									...comment,
									content: editContent.trim(),
									editedAt: new Date().toISOString(),
							  }
							: comment
					)
				);
				setEditingComment(null);
				setEditContent('');
			} else {
				throw new Error(data.error);
			}
		} catch (err) {
			console.error('Error editing comment:', err);
			alert('Failed to edit comment: ' + err.message);
		}
	};

	const handleDelete = async (comment) => {
		if (!confirm('Are you sure you want to delete this comment?')) return;

		try {
			const response = await fetch('/api/delete-comment', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					commentId: comment._id,
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
			alert('Failed to delete comment: ' + err.message);
		}
	};

	// Use the real-time hook
	useCommentUpdates(recipeId, handleNewComment, handleCommentUpdate);

	const fetchComments = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/get-comments?recipeId=${recipeId}`);

			if (!response.ok) throw new Error('Failed to fetch');

			const data = await response.json();

			if (data.success) {
				setComments(data.comments || []);
			} else {
				console.error('❌ API returned error:', data.error);
				setError('Failed to load comments');
			}
		} catch (err) {
			console.error('❌ Error fetching comments:', err);
			setError('Failed to load comments');
			setComments([]);
		} finally {
			setIsLoading(false);
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

		if (replyingTo) {
			// For replies, recursively find the parent comment and add the reply
			const addReplyToComment = (comments, parentId, newReply) => {
				return comments.map((comment) => {
					// If this is the parent comment, add the reply
					if (comment._id === parentId) {
						return {
							...comment,
							replies: [...(comment.replies || []), newReply],
						};
					}

					// If this comment has replies, search recursively
					if (comment.replies && comment.replies.length > 0) {
						return {
							...comment,
							replies: addReplyToComment(comment.replies, parentId, newReply),
						};
					}

					return comment;
				});
			};

			setComments((prev) => addReplyToComment(prev, replyingTo, tempComment));
		} else {
			// For top-level comments, add to the beginning
			setComments((prev) => [tempComment, ...prev]);
		}

		setReplyingTo(null);

		try {
			const response = await fetch('/api/submit-comment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify({
					content: newComment,
					recipeId,
					parentCommentId: replyingTo,
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
			if (replyingTo) {
				// Recursively remove the temporary reply
				const removeReplyFromComment = (comments, parentId, replyId) => {
					return comments.map((comment) => {
						// If this is the parent comment, remove the reply
						if (comment._id === parentId) {
							return {
								...comment,
								replies: (comment.replies || []).filter(
									(reply) => reply._id !== replyId
								),
							};
						}

						// If this comment has replies, search recursively
						if (comment.replies && comment.replies.length > 0) {
							return {
								...comment,
								replies: removeReplyFromComment(
									comment.replies,
									parentId,
									replyId
								),
							};
						}

						return comment;
					});
				};

				setComments((prev) =>
					removeReplyFromComment(prev, replyingTo, tempComment._id)
				);
			} else {
				setComments((prev) =>
					prev.filter((comment) => comment._id !== tempComment._id)
				);
			}
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

	// Helper function for edit time checking
	const isToday = (dateStr) => {
		const commentDate = new Date(dateStr);
		const now = new Date();
		const hoursDiff =
			(now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
		return hoursDiff <= 24; // Allow editing within 24 hours
	};

	// Render comments function
	const renderComments = (commentList, depth = 0) => {
		return commentList.map((comment) => (
			<Comment
				key={comment._id}
				comment={comment}
				depth={depth}
				user={user}
				replyingTo={replyingTo}
				setReplyingTo={setReplyingTo}
				newComment={newComment}
				setNewComment={setNewComment}
				handleSubmitComment={handleSubmitComment}
				isLoading={isLoading}
				editingComment={editingComment}
				setEditingComment={setEditingComment}
				editContent={editContent}
				setEditContent={setEditContent}
				handleSaveEdit={handleSaveEdit}
				handleCancelEdit={handleCancelEdit}
				handleDelete={handleDelete}
				isThreadExpanded={isThreadExpanded}
				toggleThread={toggleThread}
				renderComments={renderComments}
				isToday={isToday}
			/>
		));
	};

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

	return (
		<div className='comments-section'>
			{/* Header */}
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

			{/* Content */}
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
		</div>
	);
}
