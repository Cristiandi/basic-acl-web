<script>
  import { user as userFromStore } from '../common/store.js';

  import Select from 'svelte-select';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { assignedRoleService } from '../modules/assigned-roles/assigned-role.service';
  import { roleService } from '../modules/roles/role.service';
  import { userService } from '../modules/users/users.service';
  import { apiKeyService } from '../modules/api-keys/api-key.service';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { createSchema } from '../modules/assigned-roles/schemas/create.schema';

  let items = [];
  let rolesList = [];
  let usersList = [];
  let apiKeysList = [];

  $: columns = items.length
    ? Object.keys(items[0]).filter((key) => key !== '')
    : [];

  let current = {};
  let errors = {};
  let message = '';
  let loading = false;
  let loadingModal = false;

  let isCreateModalOpen = false;
  let isDeteleModalOpen = false;

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === 'init-create-assigned_role') {
      initCreate();
    } else if (action === 'init-delete-assigned_role') {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await assignedRoleService.findAll();

    return data;
  }

  async function loadRolesList() {
    const data = await roleService.findAll();

    return data.map((item) => ({
      value: item.id,
      label: `${item.code} - ${item.name}`,
    }));
  }

  async function loadUsersList() {
    const data = await userService.findAll();

    return data.map((item) => ({ value: item.id, label: item.email }));
  }

  async function loadApiKeysList() {
    const data = await apiKeyService.findAll();

    return data.map((item) => ({ value: item.id, label: item.value }));
  }

  function initCreate() {
    isCreateModalOpen = true;
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
      current.roleId = current.role ? current.role.value : current.role;
      current.userId = current.user ? current.user.value : current.user;
      current.apiKeyId = current.apiKey ? current.apiKey.value : current.apiKey;
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      await assignedRoleService.create(current);
      items = await loadData();
      isCreateModalOpen = false;
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
      await assignedRoleService.remove(current);
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
    usersList = await loadUsersList();
    apiKeysList = await loadApiKeysList();

    loading = false;
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

{#if loading}
  <div class="text-center">
    <br />
    <div class="spinner-border text-dark" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else}
  <Grid
    title={'Assigned roles'}
    {columns}
    rows={items}
    limit={10}
    actions={['init-create-assigned_role', 'init-delete-assigned_role']}
    on:message={handleMessage} />
{/if}

<Modal bind:isOpen={isCreateModalOpen}>
  <div slot="header">
    <h3>Create</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitCreate}>
      <div class="form-group">
        <label for="role">Role</label>
        <Select
          name="role"
          items={rolesList}
          bind:selectedValue={current.role} />
        {#if errors.roleId}<span class="validation">{errors.roleId}</span>{/if}
      </div>
      <div class="form-group">
        <label for="user">User</label>
        <Select
          name="user"
          items={usersList}
          bind:selectedValue={current.user} />
        {#if errors.userId}<span class="validation">{errors.userId}</span>{/if}
      </div>
      <div class="form-group">
        <label for="apiKey">Api key</label>
        <Select
          name="apiKey"
          items={apiKeysList}
          bind:selectedValue={current.apiKey} />
        {#if errors.apiKeyId}
          <span class="validation">{errors.apiKeyId}</span>
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
