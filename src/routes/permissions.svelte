<script>
  import { user as userFromStore } from '../common/store.js';

  import Select from 'svelte-select';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { permissionService } from '../modules/permissions/permission.service';
  import { roleService } from '../modules/roles/role.service';
  import { apiKeyService } from '../modules/api-keys/api-key.service';

  import { extractErrors, getMessageFromGraphQLError } from '../common/utils.js';

  import { createSchema } from '../modules/permissions/schemas/create.schema';
  import { updateSchema } from '../modules/permissions/schemas/update.schema.js';

  let items = [];
  let rolesList = [];
  let apiKeyList = [];

  const notShowInColumns = ["roleId", "roleUid", "apiKeyId", "apiKeyUid"];
  $: columns = items.length
    ? Object.keys(items[0]).filter((key) => !notShowInColumns.includes(key))
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

    if (action === 'init-create-permission') {
      initCreate();
    } else if (action === 'init-update-permission') {
      initUpdate(row);
    } else if (action === 'init-delete-permission') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await permissionService.findAll();

    return data;
  }

  async function loadRolesList() {
    const data = await roleService.findAll();

    return data.map((item) => ({ value: item.uid, label: `${item.code} - ${item.name}` }));
  }

  async function loadApiKeyList() {
    const data = await apiKeyService.findAll();

    return data.map((item) => ({ value: item.uid, label: item.alias }));
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
      role: {
        value: row.roleId,
        label: row.roleName,
      },
    };

    /*
    if (row.httpRouteId) {
      current = {
        ...current,
        httpRoute: {
          value: row.httpRouteId || undefined,
          label: row.httpRouteName || undefined,
        },
      };
    }

    if (row.graphqlActionId) {
      current = {
        ...current,
        graphqlAction: {
          value: row.graphqlActionId,
          label: row.graphqlActionName,
        },
      };
    }
    */
    
    console.log('current in updte', JSON.stringify(current));
    isUpdateModalOpen = true;
  }

  function initDelete(row) {
    current = row;
    console.log('current in delete', current);
    isDeteleModalOpen = true;
  }

  function handleRoleSelect(event) {
    current.role = event.detail;
  }

  function handleApiKeySelect(event) {
    current.apiKey = event.detail;
  }

  async function handleSubmitCreate(event) {
    console.log('current', current);
    errors = {};
    message = '';

    loadingModal = true;

    try {
      current.roleUid = current.role ? current.role.value : current.role;
      current.apiKeyUid = current.apiKey ? current.apiKey.value : current.apiKey;

      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      console.log(error);
      loadingModal = false;
      return;
    }

    try {
      await permissionService.create(current);
      items = await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      current.roleId = current.role ? current.role.value : current.role;

      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      await permissionService.update(current);
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
      await permissionService.remove(current);
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
    rolesList = await loadRolesList();
    apiKeyList = await loadApiKeyList();

    loading = false;
  });
</script>

<svelte:head>
  <title>Permissions</title>
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
    title={'Permissions'}
    {columns}
    rows={items}
    limit={10}
    actions={[
      'init-create-permission',
      'init-update-permission',
      'init-delete-permission',
    ]}
    on:message={handleMessage}
  />
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
        <label for="role">Role</label>
        <Select items={rolesList} on:select={handleRoleSelect} />
        {#if errors.roleUid}
          <span class="validation">{errors.roleUid}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="role">Api key</label>
        <Select items={apiKeyList} on:select={handleApiKeySelect} />
        {#if errors.apiKeyUid}
          <span class="validation">{errors.apiKeyUid}</span>
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
        <label class="form-check-label" for="allowed">Allowed</label>
        <input
          type="checkbox"
          class="form-control"
          name="allowed"
          id="allowed"
          bind:value={current.allowed}
          bind:checked={current.allowed}
        />
        {#if errors.allowed}
          <span class="validation">{errors.allowed}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="role">Role</label>
        <Select items={rolesList} bind:selectedValue={current.role} />
        {#if errors.roleId}
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

<style>
  .validation {
    color: red;
  }
</style>
