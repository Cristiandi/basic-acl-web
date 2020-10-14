<script>
  import { 
    showSideBar as showSideBarFromStore,
    time as timeFromStore,
    user as userFromStore
  } from '../common/store.js';
	import { goto } from '@sapper/app';
  import { userService } from '../modules/users/users.service.js';
  
  import Icon from 'svelte-awesome';
  import {
    dashboard as dashboardIcon,
    userCircleO as userCircleOIcon,
    signOut as signOutIcon,
    alignLeft as alignLeftIcon
  } from 'svelte-awesome/icons';
  import Toast from './Toast.svelte';

	export let segment;
  console.log(segment, 'segment');


  $: missingTime = Math.round((new Date($userFromStore.expirationTime).getTime() - $timeFromStore) / 1000);

  $: {
    if (missingTime <= 10 && missingTime >= 8 && window.pushToast) {
      window.pushToast(`your session is going to expire in ${missingTime} segs.`, 'error');
    }
    if (missingTime <= 0) {
      logoutClick({});
    }
  }
  
	async function logoutClick(event) {
		userService.logout();

		await goto('/');
	}
</script>

<style>
  .icon {
    color: white;
  }
</style>

<nav class="navbar navbar-expand navbar-dark bg-dark static-top">
  <div class="container-fluid">    
    <span class="icon" on:click="{e => showSideBarFromStore.set(true)}" >
      <Icon data={alignLeftIcon} scale={1.5} />
    </span>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarResponsive"
      aria-controls="navbarResponsive"
      aria-expanded="false"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon" />
    </button>

    <div class="collapse navbar-collapse" id="navbarResponsive">
      <ul class="navbar-nav ml-auto">
        <li class="nav-item active">
          <a href="/dashboard" class="nav-link">
            <Icon data={dashboardIcon} scale={1.5}/>
            <span class="sr-only">(current)</span>
          </a>
				</li>
				<li class="nav-item">
					<a href="/profile" class="nav-link">
						<Icon data={userCircleOIcon} scale={1.5}/>
					</a>
				</li>
				<li class="nav-item">
					<a href="/" class="nav-link" on:click|preventDefault={logoutClick}>
						<Icon data={signOutIcon} scale={1.5}/>
					</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<Toast />
