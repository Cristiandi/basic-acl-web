<script>
  import { showSideBar as showSideBarFromStore } from '../../common/store.js';
  import { fade } from 'svelte/transition';

  function closeSideBar() {
    showSideBarFromStore.set(false);
  }
</script>

<style>
  .sidebar {
    height: 100%;
    width: 210px;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    overflow-x: hidden;
    padding-top: 60px;
  }

  .sidebar a {
    padding: 8px 8px 8px 10px;
    text-decoration: none;
    font-size: 1rem;
    color: #818181;
    display: block;
    transition: 0.3s;
  }

  .sidebar div div a {
    padding: 8px 8px 8px 20px;
  }

  .sidebar a:hover {
    color: #f1f1f1;
  }

  .sidebar .closebtn {
    position: absolute;
    top: 0;
    right: 5px;
    font-size: 36px;
    margin-left: 50px;
    color: white;
  }

  /* On smaller screens, where height is less than 450px, change the style of the sidenav (less padding and a smaller font size) */
  @media screen and (max-height: 450px) {
    .sidebar {
      padding-top: 15px;
    }
    .sidebar a {
      font-size: 1rem;
    }
  }
</style>

<div id="mySidebar" class="sidebar bg-dark" transition:fade="{{ duration: 500 }}">
  <span class="closebtn" on:click={closeSideBar}> × </span>
  <a href="/company" on:click={closeSideBar}>Your company</a>
  <a href="/users" on:click={closeSideBar}>Users</a>
  <a href="/roles" on:click={closeSideBar}>Roles</a>
  <a href="/assigned-roles" on:click={closeSideBar}>Assigned roles</a>
  <a href="/api-keys" on:click={closeSideBar}>API keys</a>
  <a href="/permissions" on:click={closeSideBar}>Permissions</a>
  <a href="/email-templates" on:click={closeSideBar}>Email templates</a>
</div>
