<script context="module">
  export async function preload({ params, query }) {
    const { code } = query;

    if (!code) {
      return this.error(400, 'code is required.');
    }

    return {
      code,
    };
  }
</script>

<script>
  import { goto } from '@sapper/app';
  import { changeForgottenPassword } from '../modules/users/schemas/change-forgotten-password.schema';
  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';
  import { userService } from '../modules/users/users.service.js';

  let user = {};

  let successful = true;
  let errors = {};
  let message = '';
  let loading = false;

  async function handleSubmit(event) {
    errors = {};
    message = '';
    loading = true;

    try {
      user.code = code;
      await changeForgottenPassword.validate(user, { abortEarly: false });
    } catch (error) {
      errors = {
        ...extractErrors(error),
      };
      loading = false;
      return;
    }

    try {
      const result = await userService.resetPassword(user);
      message = result.message;
      loading = false;
      successful = true;

      // console.log('redirecting to', result.url);

      setTimeout(async () => {
        await goto(result.url);  
      }, 2000);
    } catch (error) {
      console.error(error);
      message = getFromObjectPathParsed(error, 'response.data.message');
      loading = false;
      successful = false;
    }
  }

  export let code;
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
</style>

<svelte:head>
  <title>Change forgotten password</title>
</svelte:head>

<div class="container-fluid" id="main">
  <div class="row">
    <div
      class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2
        centered">
      <div class="card card-container">
        <form name="form" on:submit|preventDefault={handleSubmit}>
          <h5 class="card-title">Change password</h5>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              name="password"
              id="password"
              placeholder="New password"
              bind:value={user.password} />
            {#if errors.password}
              <span class="validation">{errors.password}</span>
            {/if}
          </div>
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              name="confirmedPassword"
              id="confirmedPassword"
              placeholder="Confirm password"
              bind:value={user.confirmedPassword} />
            {#if errors.confirmedPassword}
              <span class="validation">{errors.confirmedPassword}</span>
            {/if}
          </div>
          {#if loading}
            <div class="form-group text-right">
              <div class="spinner-border text-dark" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          {:else}
            <div class="form-group text-right">
              <button class="btn btn-primary"> <span>Change</span> </button>
            </div>
          {/if}
          {#if message}
            <div class="form-group">
              <div
                class="alert alert-danger"
                role="alert"
                class:alert-danger={successful === false}
                class:alert-success={successful}>
                {message}
              </div>
            </div>
          {/if}
        </form>
      </div>
    </div>
  </div>
</div>
