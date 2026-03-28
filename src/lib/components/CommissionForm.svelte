<script lang="ts">
	import { BUDGET_RANGES } from '$lib/types/commission';

	interface Props {
		productId: string;
		productTitle: string;
		onsubmitted?: () => void;
	}

	let { productId, productTitle, onsubmitted }: Props = $props();

	let name = $state('');
	let email = $state('');
	let notes = $state('');
	let budgetRange = $state('');
	let preferredSize = $state('');
	let website = $state(''); // honeypot
	let submitting = $state(false);
	let submitted = $state(false);
	let errorMsg = $state('');

	async function handleSubmit() {
		if (!name.trim() || !email.trim()) {
			errorMsg = 'Name and email are required.';
			return;
		}

		submitting = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/commissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sourceProductId: productId,
					sourceProductTitle: productTitle,
					name: name.trim(),
					email: email.trim(),
					notes: notes.trim(),
					budgetRange,
					preferredSize: preferredSize.trim(),
					website
				})
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to submit');
			}

			submitted = true;
			onsubmitted?.();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Something went wrong. Try again.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if submitted}
	<div class="success">
		<p class="success-text">Got it — I'll be in touch within a few days.</p>
	</div>
{:else}
	<form class="form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
		<div style="position: absolute; left: -9999px;" aria-hidden="true">
			<input type="text" name="website" bind:value={website} tabindex="-1" autocomplete="off" />
		</div>

		<div class="field">
			<label for="comm-name" class="label">Name</label>
			<input id="comm-name" type="text" class="input" bind:value={name} required />
		</div>

		<div class="field">
			<label for="comm-email" class="label">Email</label>
			<input id="comm-email" type="email" class="input" bind:value={email} required />
		</div>

		<div class="field">
			<label for="comm-notes" class="label">What do you love about this piece?</label>
			<textarea id="comm-notes" class="input textarea" bind:value={notes} rows="3" placeholder="The colors, the technique, the vibe..."></textarea>
		</div>

		<div class="row">
			<div class="field">
				<label for="comm-budget" class="label">Budget range</label>
				<select id="comm-budget" class="input" bind:value={budgetRange}>
					<option value="">Select...</option>
					{#each BUDGET_RANGES as range}
						<option value={range}>{range}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="comm-size" class="label">Preferred size</label>
				<input id="comm-size" type="text" class="input" bind:value={preferredSize} placeholder="M, L, XL, etc." />
			</div>
		</div>

		{#if errorMsg}
			<p class="error">{errorMsg}</p>
		{/if}

		<button type="submit" class="submit-btn" disabled={submitting}>
			{submitting ? 'Sending...' : 'Send Request'}
		</button>
	</form>
{/if}

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: var(--font-size-compact);
		font-weight: 500;
		color: var(--occ-glass-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input {
		padding: 0.625rem 0.75rem;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 4px;
		color: var(--occ-glass-text);
		font-size: var(--font-size-sm);
		font-family: inherit;
		transition: border-color var(--duration-normal) var(--ease-out);
	}

	.input:focus {
		outline: none;
		border-color: var(--occ-purple);
	}

	.input::placeholder {
		color: var(--occ-glass-text-muted);
	}

	select.input {
		appearance: none;
		cursor: pointer;
	}

	.textarea {
		resize: vertical;
		min-height: 4rem;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.error {
		font-size: var(--font-size-compact);
		color: #e04050;
	}

	.submit-btn {
		padding: 0.75rem;
		background: var(--occ-purple);
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 4px;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.submit-btn:hover:not(:disabled) {
		background: var(--occ-purple-hover);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.success-text {
		color: var(--occ-teal);
		font-size: var(--font-size-sm);
		font-weight: 500;
		text-align: center;
		padding: 1rem 0;
	}
</style>
