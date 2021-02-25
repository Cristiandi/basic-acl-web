<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { userService } from '../modules/users/users.service.js';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { createSchema } from '../modules/users/schemas/create.schema.js';
  import { updateSchema } from '../modules/users/schemas/update.schema.js';

  let items = [];

  $: columns = items.length
    ? Object.keys(items[0]).filter((key) => key !== '')
    : [];

  let current = {};
  let errors = {};
  let message = '';
  let loading = false;
  let loadingModal = false;

  let isCreateModalOpen = false;
  let isUpdateModalOpen = false;
  let isDeteleModalOpen = false;

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === 'init-create-user') {
      initCreate();
    } else if (action === 'init-update-user') {
      initUpdate(row);
    } else if (action === 'init-delete-user') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await userService.findAll();

    return data;
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
    };
    console.log('current in updte', current);
    isUpdateModalOpen = true;
  }

  function initDelete(row) {
    current = row;
    console.log('current in delete', current);
    isDeteleModalOpen = true;
  }

  async function handleSubmitCreate(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      await userService.create(current);
      items = await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, 'response.data.message');
    }

    loadingModal = false;
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      await userService.update(current);
      items = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, 'response.data.message');
    }

    loadingModal = false;
  }

  async function handleSubmitDelete(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      await userService.remove(current);
      items = await loadData();
      isDeteleModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, 'response.data.message');
    }

    loadingModal = false;
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }
    loading = true;

    items = await loadData();

    loading = false;
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<svelte:head>
  <title>Users</title>
</svelte:head>

{#if loading}
  <div class="text-center">
    <br />
    <div class="spinner-border text-dark" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else}
  <Grid
    title={'Users'}
    {columns}
    rows={items}
    limit={10}
    actions={['init-create-user', 'init-update-user', 'init-delete-user']}
    on:message={handleMessage} />
{/if}

<Modal bind:isOpen={isCreateModalOpen}>
  <div slot="header">
    <h3>Create</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitCreate}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          class="form-control"
          name="email"
          id="email"
          bind:value={current.email} />
        {#if errors.email}<span class="validation">{errors.email}</span>{/if}
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input
          type="phone"
          class="form-control"
          name="phone"
          id="phone"
          bind:value={current.phone} />
        {#if errors.phone}<span class="validation">{errors.phone}</span>{/if}
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          class="form-control"
          name="password"
          id="password"
          bind:value={current.password} />
        {#if errors.password}
          <span class="validation">{errors.password}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="passwordConfirm">Confirm password</label>
        <input
          type="password"
          class="form-control"
          name="passwordConfirm"
          id="passwordConfirm"
          bind:value={current.passwordConfirm} />
        {#if errors.passwordConfirm}
          <span class="validation">{errors.passwordConfirm}</span>
        {/if}
      </div>
      {#if loadingModal}
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else}
        <div class="form-group">
          <button class="btn btn-primary btn-block">
            <span>Create</span>
          </button>
        </div>
      {/if}
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
  </div>
</Modal>

<Modal bind:isOpen={isUpdateModalOpen}>
  <div slot="header">
    <h3>Update</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitUpdate}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          class="form-control"
          name="email"
          id="email"
          bind:value={current.email} />
        {#if errors.email}<span class="validation">{errors.email}</span>{/if}
      </div>
      <div class="form-group">
        <label for="phone">Phone</label>
        <input
          type="phone"
          class="form-control"
          name="phone"
          id="phone"
          bind:value={current.phone} />
        {#if errors.phone}<span class="validation">{errors.phone}</span>{/if}
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          class="form-control"
          name="password"
          id="password"
          bind:value={current.password} />
        {#if errors.password}
          <span class="validation">{errors.password}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="passwordConfirm">Confirm password</label>
        <input
          type="password"
          class="form-control"
          name="passwordConfirm"
          id="passwordConfirm"
          bind:value={current.passwordConfirm} />
        {#if errors.passwordConfirm}
          <span class="validation">{errors.passwordConfirm}</span>
        {/if}
      </div>
      {#if loadingModal}
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else}
        <div class="form-group">
          <button class="btn btn-primary btn-block">
            <span>update</span>
          </button>
        </div>
      {/if}
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
  </div>
</Modal>

<Modal bind:isOpen={isDeteleModalOpen}>
  <div slot="header">
    <h3>Delete</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitDelete}>
      <div class="form-group">
        <h3>¿Do you want to delete?</h3>
      </div>
      {#if loadingModal}
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else}
        <div class="form-group">
          <button class="btn btn-primary btn-block">
            <span>Delete</span>
          </button>
        </div>
      {/if}
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
  </div>
</Modal>
