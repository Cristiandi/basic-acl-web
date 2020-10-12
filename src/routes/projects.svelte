<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { projectService } from '../modules/projects/project.service';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { createSchema } from '../modules/projects/schemas/create.schema';
  import { updateSchema } from '../modules/projects/schemas/update.schema.js';

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

    if (action === 'init-create-project') {
      initCreate();
    } else if (action === 'init-update-project') {
      initUpdate(row);
    } else if (action === 'init-delete-project') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await projectService.findAll();

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
      await projectService.create(current);
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
      await projectService.update(current);
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
      await projectService.remove(current);
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
  <title>Projects</title>
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
    title={'Projects'}
    {columns}
    rows={items}
    limit={10}
    actions={['init-create-project', 'init-update-project', 'init-delete-project']}
    on:message={handleMessage} />
{/if}

<Modal bind:isOpen={isCreateModalOpen}>
  <div slot="header">
    <h3>Create</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitCreate}>
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
        <label for="code">Code</label>
        <input
          type="text"
          class="form-control"
          name="code"
          id="code"
          bind:value={current.code} />
        {#if errors.code}<span class="validation">{errors.code}</span>{/if}
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
    <h3>update</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitUpdate}>
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
        <label for="code">Code</label>
        <input
          type="text"
          class="form-control"
          name="code"
          id="code"
          bind:value={current.code} />
        {#if errors.code}<span class="validation">{errors.code}</span>{/if}
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
