// src/components/EmojiPicker.jsx
import { useState, useEffect, useRef } from 'react';

const EMOJI_CATEGORIES = {
	smileys: [
		'😀',
		'😃',
		'😄',
		'😁',
		'😆',
		'😅',
		'😂',
		'🤣',
		'😊',
		'😇',
		'🙂',
		'😉',
		'😌',
		'😍',
		'🥰',
	],
	food: [
		'🍎',
		'🍕',
		'🍔',
		'🍟',
		'🌮',
		'🍣',
		'🍦',
		'🍩',
		'☕',
		'🍷',
		'🍗',
		'🥑',
		'🥦',
		'🍫',
	],
	symbols: ['❤️', '⭐', '🔥', '🎉', '👍', '👎', '🙏', '💯', '👏', '🎂', '🏆'],
	nature: ['🌞', '🌙', '⭐', '🌟', '🌈', '🔥', '💧', '🌊', '🍀', '🌺'],
};

export default function EmojiPicker({ onEmojiSelect }) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeCategory, setActiveCategory] = useState('smileys');
	const pickerRef = useRef(null);

	// Close picker when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (pickerRef.current && !pickerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className='relative' ref={pickerRef}>
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='p-1 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors'
				aria-label='Add emoji'
			>
				<span className='text-lg'>😊</span>
			</button>

			{isOpen && (
				<div className='absolute bottom-full mb-2 right-0 sm:left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-64 sm:w-72 max-w-[90vw]'>
					{/* Category Tabs - Scrollable on mobile */}
					<div className='flex border-b border-gray-200 overflow-x-auto'>
						{Object.keys(EMOJI_CATEGORIES).map((category) => (
							<button
								key={category}
								onClick={() => setActiveCategory(category)}
								className={`flex-shrink-0 px-3 py-2 text-xs capitalize whitespace-nowrap ${
									activeCategory === category
										? 'bg-gray-100 text-gray-800 border-b-2 border-blue-500'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							>
								{category}
							</button>
						))}
					</div>

					{/* Emoji Grid - Responsive sizing */}
					<div className='grid grid-cols-8 gap-1 p-2 max-h-32 sm:max-h-40 overflow-y-auto'>
						{EMOJI_CATEGORIES[activeCategory].map((emoji) => (
							<button
								key={emoji}
								type='button'
								onClick={() => {
									onEmojiSelect(emoji);
									setIsOpen(false);
								}}
								className='p-1 sm:p-1.5 hover:bg-gray-100 rounded text-base sm:text-lg transition-colors transform hover:scale-110'
								aria-label={`Emoji ${emoji}`}
							>
								{emoji}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
