<script>
  import { user as userFromStore } from '../common/store.js';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import { userService } from '../modules/users/users.service.js';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { createCompanyAdminSchema } from '../modules/users/schemas/create-company-admin.schema.js';

  let user = {};

  let successful = true;
  let errors = {};
  let message = '';
  let loading = false;

  onMount(async () => {
    if ($userFromStore) {
      await goto('/dashboard');
    }
  });

  async function handleSubmit(event) {
    errors = {};
    message = '';
    loading = true;

    try {
      await createCompanyAdminSchema.validate(user, { abortEarly: false });
    } catch (error) {
      console.log('error', error);
      errors = {
        ...extractErrors(error),
      };
      loading = false;
      return;
    }

    try {
      const result = await userService.createCompanyAdmin(user);
      successful = true;
      message = result.message;
    } catch (error) {
      successful = false;
      message = getFromObjectPathParsed(error, 'response.data.message');
    }

    loading = false;
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
  <title>Create company admin</title>
</svelte:head>

<div class="container-fluid" id="main">
  <div class="row">
    <div
      class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2
        centered">
      <div class="card card-container">
        <form name="form" on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              name="companyUuid"
              id="companyUuid"
              placeholder="Company UUID"
              bind:value={user.companyUuid} />
            {#if errors.companyUuid}<span class="validation">{errors.companyUuid}</span>{/if}
          </div>
          <div class="form-group">
            <input
              type="email"
              class="form-control"
              name="email"
              id="email"
              placeholder="Email"
              bind:value={user.email} />
            {#if errors.email}<span class="validation">{errors.email}</span>{/if}
          </div>
          <div class="form-group">
            <input
              type="phone"
              class="form-control"
              name="phone"
              id="phone"
              placeholder="Phone"
              bind:value={user.phone} />
            {#if errors.phone}<span class="validation">{errors.phone}</span>{/if}
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
          <div class="form-group">
            <input
              type="password"
              class="form-control"
              name="passwordConfirm"
              id="passwordConfirm"
              placeholder="Password confirm"
              bind:value={user.passwordConfirm} />
            {#if errors.passwordConfirm}
              <span class="validation">{errors.passwordConfirm}</span>
            {/if}
          </div>
          {#if loading}
            <div class="form-group text-right">
              <div class="spinner-border text-dark" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          {:else}
          <div class="form-group">
            <button class="btn btn-primary btn-block"> <span>Create</span> </button>
          </div>
          {/if}
          {#if message}
            <div class="form-group">
              <div
                class="alert"
                role="alert"
                class:alert-danger={successful === false}
                class:alert-success={successful}>
                {message}
              </div>
            </div>
          {/if}
          <div class="form-group links"><a href="/">Go login</a></div>
        </form>
      </div>
    </div>
  </div>
</div>
