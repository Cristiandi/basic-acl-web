<script>
  import { user as userFromStore } from '../common/store';

  import Select from 'svelte-select';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { graphqlActionService } from '../modules/graphql-actions/graphql-action.service';
  import { projectService } from '../modules/projects/project.service';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils';

  import { createSchema } from '../modules/graphql-actions/schemas/create.schema';
  import { updateSchema } from '../modules/graphql-actions/schemas/update.schema';

  let items = [];
  let projectsList = [];

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

    if (action === 'init-create-graphql_action') {
      initCreate();
    } else if (action === 'init-update-graphql_action') {
      initUpdate(row);
    } else if (action === 'init-delete-graphql_action') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await graphqlActionService.findAll();

    return data;
  }

  async function loadProjectsList() {
    const data = await projectService.findAll();

    return data.map((item) => ({ value: item.id, label: item.name }));
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
      project: {
        value: row.projectId,
        label: row.projectName,
      },
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
      current.projectId = current.project
        ? current.project.value
        : current.project;

      current.isQuery = current.isQuery || false;
      current.isMutation = current.isMutation || false;

      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      console.log(error);
      loadingModal = false;
      return;
    }

    try {
      await graphqlActionService.create(current);
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
      current.projectId = current.project
        ? current.project.value
        : current.project;
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      await graphqlActionService.update(current);
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
      await graphqlActionService.remove(current);
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
    projectsList = await loadProjectsList();

    loading = false;
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<svelte:head>
  <title>GraphQL actions</title>
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
    title={'GraphQL Actions'}
    {columns}
    rows={items}
    limit={10}
    actions={['init-create-graphql_action', 'init-update-graphql_action', 'init-delete-graphql_action']}
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
        <label for="method">isQuery</label>
        <input
          type="checkbox"
          class="form-control"
          name="isQuery"
          id="isQuery"
          bind:value={current.isQuery}
          bind:checked={current.isQuery} />
        {#if errors.isQuery}<span class="validation">{errors.isQuery}</span>{/if}
      </div>
      <div class="form-group">
        <label for="path">isMutation</label>
        <input
          type="checkbox"
          class="form-control"
          name="isMutation"
          id="isMutation"
          bind:value={current.isMutation}
          bind:checked={current.isMutation} />
        {#if errors.isMutation}<span class="validation">{errors.isMutation}</span>{/if}
      </div>
      <div class="form-group">
        <label for="project">Project</label>
        <Select
          name="project"
          items={projectsList}
          bind:selectedValue={current.project} />
        {#if errors.projectId}
          <span class="validation">{errors.projectId}</span>
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
        <label for="method">isQuery</label>
        <input
          type="checkbox"
          class="form-control"
          name="isQuery"
          id="isQuery"
          bind:value={current.isQuery}
          bind:checked={current.isQuery} />
        {#if errors.isQuery}<span class="validation">{errors.isQuery}</span>{/if}
      </div>
      <div class="form-group">
        <label for="path">isMutation</label>
        <input
          type="checkbox"
          class="form-control"
          name="isMutation"
          id="isMutation"
          bind:value={current.isMutation}
          bind:checked={current.isMutation} />
        {#if errors.isMutation}<span class="validation">{errors.isMutation}</span>{/if}
      </div>
      <div class="form-group">
        <label for="project">Project</label>
        <Select
          name="project"
          items={projectsList}
          bind:selectedValue={current.project} />
        {#if errors.projectId}
          <span class="validation">{errors.projectId}</span>
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
