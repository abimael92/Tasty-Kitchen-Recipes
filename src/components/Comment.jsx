import { useState } from 'react';
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
}) => {
	const [showMenu, setShowMenu] = useState(false);

	const canEdit =
		user?._id === comment.author?._id && isToday(comment.publishedAt);
	const canDelete = user?._id === comment.author?._id;
	const hasReplies = comment.replies && comment.replies.length > 0;
	const isThreadView = isThreadExpanded(comment._id);
	const showThreadButton = hasReplies && depth >= 2;
	const showNormalNesting = depth < 2 || isThreadView;

	const isToday = (dateStr) => {
		const commentDate = new Date(dateStr);
		const now = new Date();
		const hoursDiff =
			(now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
		return hoursDiff <= 24;
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

	return (
		<div
			className={`comment-thread ${depth > 0 ? 'nested' : ''} ${
				isThreadView ? 'thread-expanded' : ''
			}`}
		>
			<div className='comment-card'>
				{/* Comment Header */}
				<div className='comment-header'>
					<div className='comment-author'>
						<img
							src={comment.author?.image || '/default-avatar.png'}
							alt={comment.author?.name}
							className='comment-avatar'
						/>
						<span className='comment-author-name'>
							{comment.author?.name} {comment.author?.lastname || 'Anonymous'}
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

				{/* Comment Content */}
				<div className='comment-content-wrapper'>
					{editingComment === comment._id ? (
						<div className='comment-edit-form'>
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className='edit-comment-textarea'
								rows='3'
								maxLength='1000'
							/>
							<div className='edit-comment-actions'>
								<button
									onClick={() => handleSaveEdit(comment._id)}
									className='save-edit-btn'
									disabled={!editContent.trim()}
								>
									Save
								</button>
								<button onClick={handleCancelEdit} className='cancel-edit-btn'>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<>
							<p className='comment-content'>
								{comment.content}
								{comment.editedAt && (
									<span className='comment-edited-badge'>(edited)</span>
								)}
							</p>

							{/* Comment Menu */}
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
													onClick={handleEdit}
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
									)}
								</div>
							)}
						</>
					)}
				</div>

				{/* Comment Actions */}
				<div className='comment-actions'>
					<div className='comment-buttons'>
						{user && (
							<button
								onClick={() => {
									if (replyingTo === comment._id) {
										setReplyingTo(null);
										setNewComment('');
									} else {
										setReplyingTo(comment._id);
										setNewComment('');
									}
								}}
								className='comment-reply-btn'
							>
								{replyingTo === comment._id ? 'Cancel' : 'Reply'}
							</button>
						)}
						{comment.isApproved === false && (
							<span className='comment-moderation'>Awaiting moderation</span>
						)}
					</div>

					{/* Thread Controls */}
					<div className='comment-thread-controls'>
						{hasReplies && (
							<span className='comment-replies-count'>
								{comment.replies.length}{' '}
								{comment.replies.length === 1 ? 'reply' : 'replies'}
							</span>
						)}
						{showThreadButton && (
							<button
								onClick={() => toggleThread(comment._id)}
								className='view-thread-btn'
							>
								{isThreadView ? (
									<>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M19 13H5v-2h14v2z' />
										</svg>
										Collapse Thread
									</>
								) : (
									<>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' />
										</svg>
										View Thread ({comment.replies.length})
									</>
								)}
							</button>
						)}
					</div>
				</div>

				{/* Reply Form */}
				{replyingTo === comment._id && (
					<form onSubmit={handleSubmitComment} className='reply-form'>
						<div className='reply-input-group'>
							<div className='reply-textarea-wrapper'>
								<textarea
									value={newComment}
									onChange={(e) => setNewComment(e.target.value)}
									placeholder={`Reply to ${
										comment.author?.name || 'this comment'
									}...`}
									className='reply-textarea'
									rows='3'
									maxLength='1000'
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
									{isLoading ? 'Posting...' : 'Post Reply'}
								</button>
								<button
									type='button'
									onClick={() => {
										setReplyingTo(null);
										setNewComment('');
									}}
									className='cancel-reply-btn'
								>
									Cancel
								</button>
							</div>
						</div>
					</form>
				)}

				{/* Nested Replies */}
				{hasReplies && (
					<>
						{showNormalNesting && !isThreadView && (
							<div className='nested-comments'>
								{renderComments(comment.replies, depth + 1)}
							</div>
						)}

						{isThreadView && (
							<div className='thread-view'>
								<div className='thread-header'>
									<button
										onClick={() => toggleThread(comment._id)}
										className='thread-back-btn'
									>
										<svg
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='currentColor'
										>
											<path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z' />
										</svg>
										Back to main discussion
									</button>
								</div>
								<div className='thread-comments'>
									{renderComments(comment.replies, 0)}
								</div>
							</div>
						)}

						{!showNormalNesting && !isThreadView && (
							<div className='thread-hint'>
								<button
									onClick={() => toggleThread(comment._id)}
									className='view-thread-hint-btn'
								>
									💬 Continue this thread ({comment.replies.length} more{' '}
									{comment.replies.length === 1 ? 'reply' : 'replies'})
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default Comment;
