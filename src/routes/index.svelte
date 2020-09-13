<script>
  import { user as userFromStore } from '../common/store.js';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import { userService } from '../modules/users/users.service.js';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { loginSchema } from '../modules/users/schemas/login.schema.js';

  let user = {};

  let errors = {};
  let message = '';

  onMount(async () => {
    if ($userFromStore) {
      await goto('/dashboard');
    }
  });

  async function handleSubmit(event) {
    errors = {};
    message = '';

    try {
      await loginSchema.validate(user, { abortEarly: false });
    } catch (error) {
      errors = {
        ...extractErrors(error),
      };
      return;
    }

    try {
      await userService.login({
        email: user.email,
        password: user.password,
        companyName: user.companyName,
      });

      goto('/dashboard');
    } catch (error) {
      console.error(error);
      message = getFromObjectPathParsed(error, 'response.data.message');
    }
  }
</script>

<style>
  #main {
    background-image: url("/bg.svg");
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 100% 100%;
  }

  .card-container.card {
    padding: 2rem 2rem;
  }

  .card {
    background-color: #f7f7f7;
    padding: 20px 25px 30px;
    -moz-border-radius: 2px;
    -webkit-border-radius: 2px;
    border-radius: 2px;
    -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  }

  .centered {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
  }

  .validation {
    color: red;
  }

  .links {
    font-size: smaller;
  }
</style>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="container-fluid" id="main">
  <div class="row">
    <div
      class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2
        centered">
      <div class="card card-container">
        <form name="form" on:submit|preventDefault={handleSubmit}>
          <h5 class="card-title">Login</h5>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              name="companyName"
              id="companyName"
              placeholder="Company name"
              bind:value={user.companyName} />
            {#if errors.companyName}
              <span class="validation">{errors.companyName}</span>
            {/if}
          </div>
          <div class="form-group">
            <input
              type="email"
              class="form-control"
              name="email"
              id="email"
              placeholder="Email"
              bind:value={user.email} />
            {#if errors.password}
              <span class="validation">{errors.email}</span>
            {/if}
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              name="password"
              id="password"
              placeholder="Password"
              bind:value={user.password} />
            {#if errors.password}
              <span class="validation">{errors.password}</span>
            {/if}
          </div>
          <div class="form-group links">
            <a href="/create-company">Want to start?</a>
            <br/>
            <span>Already loaded company data? </span><a href="/create-company-admin">Create company admin</a>
          </div>
          <div class="form-group text-right">
            <button class="btn btn-primary"> <span>Go</span> </button>
          </div>
          {#if message}
            <div class="form-group">
              <div class="alert alert-danger" role="alert">{message}</div>
            </div>
          {/if}
        </form>
      </div>
    </div>
  </div>
</div>
