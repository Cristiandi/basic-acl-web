<script>
  import { forgottenPassword } from '../modules/users/schemas/forgotten-password.schema';
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
      await forgottenPassword.validate(user, { abortEarly: false });
    } catch (error) {
      errors = {
        ...extractErrors(error),
      };
      loading = false;
      return;
    }

    try {
      const result = await userService.forgottenPassword(user);
      message = result.message;
      loading = false;
      successful = true;
    } catch (error) {
      console.error(error);
      message = getFromObjectPathParsed(error, 'response.data.message');
      loading = false;
      successful = false;
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
</style>

<svelte:head>
  <title>Forgotten password</title>
</svelte:head>

<div class="container-fluid" id="main">
  <div class="row">
    <div
      class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2
        centered">
      <div class="card card-container">
        <form name="form" on:submit|preventDefault={handleSubmit}>
          <h5 class="card-title">Forgotten password</h5>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              name="companyUuid"
              id="companyUuid"
              placeholder="Company uuid"
              bind:value={user.companyUuid} />
            {#if errors.companyUuid}
              <span class="validation">{errors.companyUuid}</span>
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
