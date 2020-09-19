<script>
	import {
		user as userFromStore,
		showSideBar as showSideBarFromStore
	} from '../common/store.js';

	import Nav from '../components/Nav.svelte';
	import SideBar from '../components/SideBar';

	export let segment;

	// console.log('userFromStore', $userFromStore);
</script>

<style>
</style>

{#if $userFromStore}
	<Nav {segment}/>
{/if}

{#if $userFromStore && $showSideBarFromStore}
	<SideBar />
{/if}

<main>
	<slot></slot>
</main>