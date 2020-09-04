<script>
import { onMount } from 'svelte';
import { goto } from '@sapper/app';

	import { user as userFromStore } from '../common/store.js';

	onMount(async() => {
			// console.log($userFromStore, 'userFromStore');
			
			if (!$userFromStore) {
				await goto('/');
			}
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<h1>About this site</h1>

<p>This is the 'about' page. There's not much here.</p>