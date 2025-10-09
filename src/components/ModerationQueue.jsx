// src/components/ModerationQueue.jsx (Admin only)
export default function ModerationQueue() {
	const [pendingComments, setPendingComments] = useState([]);

	useEffect(() => {
		fetchPendingComments();
	}, []);

	const fetchPendingComments = async () => {
		const response = await fetch('/api/pending-comments');
		const comments = await response.json();
		setPendingComments(comments);
	};

	const moderateComment = async (commentId, action) => {
		await fetch('/api/moderate-comment', {
			method: 'POST',
			body: JSON.stringify({ commentId, action }), // 'approve' or 'reject'
		});
		fetchPendingComments(); // Refresh
	};

	return (
		<div className='moderation-queue'>
			<h2>Comments Awaiting Moderation ({pendingComments.length})</h2>
			{pendingComments.map((comment) => (
				<div key={comment._id} className='moderation-item'>
					<p>{comment.content}</p>
					<div className='moderation-actions'>
						<button onClick={() => moderateComment(comment._id, 'approve')}>
							✅ Approve
						</button>
						<button onClick={() => moderateComment(comment._id, 'reject')}>
							❌ Reject
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
