<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }
  });
</script>

<style>
  .main-section {
    background-color: #fff;
  }
  .profile-header {
    background-color: #fff;
    height: 150px;
  }
  .user-detail {
    margin: -50px 0px 30px 0px;
  }
  .user-detail img {
    height: 100px;
    width: 100px;
  }
  .user-detail h5 {
    margin: 15px 0px 5px 0px;
  }
</style>

<svelte:head>
  <title>Profile</title>
</svelte:head>

{#if $userFromStore}
  <div class="container">
    <div class="row">
      <div
        class="offset-lg-4 col-lg-4 col-sm-6 col-12 main-section text-center">
        <div class="row">
          <div class="col-lg-12 col-sm-12 col-12 profile-header" />
        </div>
        <div class="row user-detail">
          <div class="col-lg-12 col-sm-12 col-12">
            <img
              src="/user-avatar.png"
              class="rounded-circle img-thumbnail"
              alt="user avatar" />
            <h5>{$userFromStore.email}</h5>
            <p>
              <i class="fa fa-map-marker" aria-hidden="true" />
              {$userFromStore.phone}
            </p>

            <hr />
            <a href="/company" class="btn btn-primary btn-sm">Your company</a>

            <hr />
            <span>You session was created in {new Date($userFromStore.authTime).toLocaleString()} 
              and will expire in {new Date($userFromStore.expirationTime).toLocaleString()}.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
