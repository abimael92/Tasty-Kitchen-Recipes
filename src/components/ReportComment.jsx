// src/components/ReportComment.jsx
export default function ReportComment({ commentId, onReport }) {
	const [isOpen, setIsOpen] = useState(false);
	const [reason, setReason] = useState('');

	const reportReasons = [
		'Inappropriate language',
		'Harassment or bullying',
		'Spam or misleading',
		'Off-topic',
		'Personal information',
		'Hate speech',
		'Other',
	];

	const handleReport = async () => {
		await fetch('/api/report-comment', {
			method: 'POST',
			body: JSON.stringify({ commentId, reason }),
		});
		onReport?.();
		setIsOpen(false);
	};

	return (
		<div className='report-wrapper'>
			<button onClick={() => setIsOpen(true)} className='report-btn'>
				⚠️ Report
			</button>

			{isOpen && (
				<div className='report-modal'>
					<h3>Report Comment</h3>
					<select value={reason} onChange={(e) => setReason(e.target.value)}>
						<option value=''>Select a reason</option>
						{reportReasons.map((reason) => (
							<option key={reason} value={reason}>
								{reason}
							</option>
						))}
					</select>
					<button onClick={handleReport} disabled={!reason}>
						Submit Report
					</button>
				</div>
			)}
		</div>
	);
}
