<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { roleService } from '../modules/roles/role.service';

  import { extractErrors, getMessageFromGraphQLError } from '../common/utils.js';

  import { createSchema } from '../modules/roles/schemas/create.schema';
  import { updateSchema } from '../modules/roles/schemas/update.schema.js';

  let roles = [];

  const notShowInColumns = ['uid'];
  $: columns = roles.length
    ? Object.keys(roles[0]).filter((key) => !notShowInColumns.includes(key))
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

    if (action === 'init-create-role') {
      initCreate();
    } else if (action === 'init-update-role') {
      initUpdate(row);
    } else if (action === 'init-delete-role') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await roleService.findAll();

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
      console.log(error);
      loadingModal = false;
      return;
    }

    try {
      await roleService.create(current);
      roles = await loadData();
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
      await roleService.update(current);
      roles = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitDelete(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      await roleService.remove(current);
      roles = await loadData();
      isDeteleModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }
    loading = true;
    roles = await loadData();
    loading = false;
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<svelte:head>
  <title>Roles</title>
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
    title={'Roles'}
    {columns}
    rows={roles}
    limit={10}
    actions={['init-create-role', 'init-update-role', 'init-delete-role']}
    on:message={handleMessage} />
{/if}

<div class="row">
  <div class="col-md-6">
    <Modal bind:isOpen={isCreateModalOpen}>
      <div slot="header">
        <h3>Create</h3>
      </div>
      <div slot="content">
        <form name="form" on:submit|preventDefault={handleSubmitCreate}>
          <div class="form-group">
            <label for="code">Code</label>
            <input
              type="text"
              class="form-control"
              name="code"
              id="code"
              bind:value={current.code} />
            {#if errors.code}<span class="validation">{errors.code}</span>{/if}
          </div>
          <div class="form-group">
            <label for="name">Name</label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="name"
              bind:value={current.name} />
            {#if errors.name}<span class="validation">{errors.name}</span>{/if}
          </div>
          <div class="form-group">
            <label for="code">Description</label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="description"
              bind:value={current.description} />
            {#if errors.description}<span class="validation">{errors.description}</span>{/if}
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
  </div>
</div>

<Modal bind:isOpen={isUpdateModalOpen}>
  <div slot="header">
    <h3>update</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitUpdate}>
      <div class="form-group">
        <label for="code">Code</label>
        <input
          type="text"
          class="form-control"
          name="code"
          id="code"
          bind:value={current.code} />
        {#if errors.code}<span class="validation">{errors.code}</span>{/if}
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          class="form-control"
          name="name"
          id="name"
          bind:value={current.name} />
        {#if errors.name}<span class="validation">{errors.name}</span>{/if}
      </div>
      <div class="form-group">
        <label for="code">Description</label>
        <input
          type="text"
          class="form-control"
          name="description"
          id="description"
          bind:value={current.description} />
        {#if errors.description}<span class="validation">{errors.description}</span>{/if}
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
