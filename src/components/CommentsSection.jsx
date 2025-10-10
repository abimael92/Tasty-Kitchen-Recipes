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

	// Real-time updates
	const handleNewComment = useCallback((newComment) => {
		// ... keep your existing handleNewComment logic
	}, []);

	const handleCommentUpdate = useCallback((updatedComment) => {
		// ... keep your existing handleCommentUpdate logic
	}, []);

	// Use the real-time hook
	useCommentUpdates(recipeId, handleNewComment, handleCommentUpdate);

	// Thread management
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

	// Comment actions (handleEdit, handleSaveEdit, handleDelete, etc.)
	// ... keep your existing comment action functions

	// Fetch comments function
	const fetchComments = async () => {
		// ... keep your existing fetchComments logic
	};

	// Submit comment function
	const handleSubmitComment = async (e) => {
		// ... keep your existing handleSubmitComment logic
	};

	const handleEmojiSelect = (emoji) => {
		setNewComment((prev) => prev + emoji);
	};

	// Render comments function (simplified)
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
							<button className='login-comment-btn'>Log In to Comment</button>
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
