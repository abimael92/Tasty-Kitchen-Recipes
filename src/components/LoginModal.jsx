import React, { useState } from 'react';
import { t } from '../utils/i18n';

export default function LoginModal({
	isOpen,
	onClose,
	onLogin,
	onRegister,
	error,
	loading,
	locale,
	isRegistering,
	setIsRegistering,
}) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [lastname, setLastname] = useState('');
	const [role, setRole] = useState('');
	const [bio, setBio] = useState('');
	const [location, setLocation] = useState('');
	const [phone, setPhone] = useState('');
	const [dietPreference, setDietPreference] = useState('');
	const [allergies, setAllergies] = useState('');
	const [preferredCuisine, setPreferredCuisine] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (isRegistering) {
			await onRegister({
				email,
				password,
				name,
				lastname,
				role,
				bio,
				location,
				phone,
				dietPreference,
				allergies: allergies.split(',').map((a) => a.trim()),
				preferredCuisine: preferredCuisine.split(',').map((c) => c.trim()),
			});
		} else {
			await onLogin(email, password);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 9999,
			}}
			onClick={onClose}
		>
			<div
				className='modal-content'
				style={{
					background: 'white',
					padding: '2rem',
					borderRadius: '8px',
					width: '90%',
					maxWidth: '650px',
					boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					overflow: 'hidden',
					transition: 'all 0.3s ease',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h2 style={{ marginTop: 0 }}>
					{isRegistering
						? t('auth.register', locale) || 'Register'
						: t('auth.login', locale)}
				</h2>

				{error && (
					<div
						style={{
							color: 'red',
							marginBottom: '1rem',
							padding: '0.5rem',
							backgroundColor: '#ffeeee',
							borderRadius: '4px',
						}}
					>
						{error}
					</div>
				)}

				<div className='auth-form-wrapper'>
					<form
						onSubmit={handleSubmit}
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: '0.125rem',
						}}
					>
						<div
							style={{
								width: '585px',
								marginBottom: isRegistering ? '0.5rem' : 0,
							}}
						>
							<label htmlFor='email'>{t('auth.email', locale)}</label>
							<input
								type='email'
								id='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								style={{ width: '100%', padding: '0.5rem' }}
								required
								disabled={loading}
							/>
						</div>

						<div
							className={`register-fields ${
								isRegistering ? 'visible' : 'hidden'
							}`}
						>
							<div>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '1rem',
									}}
								>
									<div style={{ width: '250px' }}>
										<label htmlFor='name'>First Name</label>
										<input
											id='name'
											value={name}
											onChange={(e) => setName(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
											required={isRegistering}
										/>
									</div>

									<div style={{ width: '250px' }}>
										<label htmlFor='lastname'>Last Name</label>
										<input
											id='lastname'
											value={lastname}
											onChange={(e) => setLastname(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
											required={isRegistering}
										/>
									</div>

									<div style={{ width: '250px' }}>
										<label htmlFor='phone'>Phone</label>
										<input
											id='phone'
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
										/>
									</div>

									<div style={{ width: '250px' }}>
										<label htmlFor='location'>Location</label>
										<input
											id='location'
											value={location}
											onChange={(e) => setLocation(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
										/>
									</div>
								</div>

								<div
									style={{
										width: '400px',
										margin: '1rem auto',
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									<label
										style={{
											alignSelf: 'flex-start',
										}}
										htmlFor='bio'
									>
										Short Bio
									</label>
									<textarea
										id='bio'
										value={bio}
										onChange={(e) => setBio(e.target.value)}
										style={{ width: '100%', padding: '1rem' }}
									/>
								</div>

								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '1rem',
									}}
								>
									<div style={{ width: '250px' }}>
										<label htmlFor='dietPreference'>Diet Preference</label>
										<input
											id='dietPreference'
											value={dietPreference}
											onChange={(e) => setDietPreference(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
										/>
									</div>

									<div style={{ width: '250px' }}>
										<label htmlFor='allergies'>
											Allergies{' '}
											<span style={{ fontSize: '14px' }}>
												(comma-separated)
											</span>
										</label>
										<input
											id='allergies'
											value={allergies}
											onChange={(e) => setAllergies(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
										/>
									</div>

									<div style={{ width: '250px' }}>
										<label htmlFor='preferredCuisine'>
											Preferred Cuisines{' '}
											<span style={{ fontSize: '14px' }}>
												(comma-separated)
											</span>
										</label>
										<input
											id='preferredCuisine'
											value={preferredCuisine}
											onChange={(e) => setPreferredCuisine(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
										/>
									</div>

									<div style={{ width: '270px' }}>
										<label htmlFor='role'>Role</label>
										<select
											id='role'
											value={role}
											onChange={(e) => setRole(e.target.value)}
											style={{ width: '100%', padding: '0.5rem' }}
											required={isRegistering}
										>
											<option value=''>Select Role</option>
											<option value='client'>Client</option>
											<option value='chef'>Chef</option>
										</select>
									</div>
								</div>
							</div>
						</div>

						<div style={{ width: '585px' }}>
							<label htmlFor='password'>{t('auth.password', locale)}</label>
							<input
								type='password'
								id='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								style={{ width: '100%', padding: '0.5rem' }}
								required
								minLength={6}
								disabled={loading}
							/>
						</div>

						<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
							<button
								type='button'
								onClick={onClose}
								disabled={loading}
								style={{
									padding: '0.5rem 1rem',
									backgroundColor: 'var(--color-dark)',
									border: '1px solid #ccc',
									borderRadius: '4px',
									cursor: 'pointer',
									flex: 1,
								}}
							>
								{t('auth.cancel', locale) || 'Cancel'}
							</button>
							<button
								type='submit'
								disabled={loading}
								style={{
									padding: '0.5rem 1rem',
									backgroundColor: loading
										? 'var(--color-secondary)'
										: 'var(--color-primary)',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: loading ? 'not-allowed' : 'pointer',
									flex: 1,
								}}
							>
								{loading
									? isRegistering
										? t('auth.registering', locale) || 'Registering...'
										: t('auth.loggingIn', locale) || 'Logging in...'
									: isRegistering
									? t('auth.register', locale) || 'Register'
									: t('auth.login', locale) || 'Login'}
							</button>
						</div>
					</form>
				</div>

				<p style={{ marginTop: '1rem', textAlign: 'center' }}>
					{isRegistering
						? t('auth.haveAccount', locale) || 'Already have an account?'
						: t('auth.noAccount', locale) || "Don't have an account?"}{' '}
					<button
						type='button'
						onClick={() => setIsRegistering(!isRegistering)}
						style={{
							background: 'none',
							border: 'none',
							color: 'var(--color-primary)',
							textDecoration: 'underline',
							cursor: 'pointer',
							padding: 0,
							font: 'inherit',
						}}
					>
						{isRegistering
							? t('auth.login', locale) || 'Log in'
							: t('auth.createOne', locale) || 'Create one'}
					</button>
				</p>
			</div>

			<style jsx>{`
				.modal-content {
					display: grid;
					grid-template-rows: auto 1fr auto;
				}

				.auth-form-wrapper {
					overflow: hidden;
				}

				.register-fields {
					display: grid;
					grid-template-rows: 0fr;
					transition: grid-template-rows 0.3s ease;
					overflow: hidden;
				}

				.register-fields > div {
					min-height: 0;
					overflow: hidden;
				}

				.register-fields.visible {
					grid-template-rows: 1fr;
				}
			`}</style>
		</div>
	);
}
