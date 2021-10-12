<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';
  import { window } from 'lodash/_freeGlobal';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';
  import Toast from '../components/Toast.svelte';

  import { companiesService } from '../modules/companies/companies.service.js';
  import { userService } from '../modules/users/users.service';

  import { extractErrors, getMessageFromGraphQLError } from '../common/utils.js';

  import { updateSchema } from '../modules/companies/schemas/update.schema.js';

  let companies = [];

  const notShowInColumns = ['firebaseAdminConfig', 'firebaseConfig'];
  $: columns = companies.length
    ? Object.keys(companies[0]).filter((key) => !notShowInColumns.includes(key))
    : [];

  let current = {};
  let errors = {};
  let message = '';
  let loading = false;
  let loadingCreateUsers = false;
  let loadingModal = false;

  let isUpdateModalOpen = false;

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === 'init-update-company') {
      initUpdate(row);
    }
  }

  async function loadData() {
    const data = await companiesService.getCompany();

    return data;
  }

  function initUpdate(row) {
    current = {
      ...row,
    };
    console.log('current in updte', current);
    isUpdateModalOpen = true;
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
      await companiesService.updateCompany(current);
      companies = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleCreateUsersFromFirebaseClick(event) {
    let localMessage = '';
    loadingCreateUsers = true;
    try {
      const result = await userService.createUsersFromFirebase();
      localMessage = result.message;

      window.pushToast(localMessage, 'success');
    } catch (error) {
      localMessage = getMessageFromGraphQLError(error);

      window.pushToast(localMessage, 'error');
    }
    loadingCreateUsers = false;
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }

    loading = true;
    companies = await loadData();
    loading = false;
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<svelte:head>
  <title>Company</title>
</svelte:head>

<div class="container">
  <h1>Company</h1>
  <div class="row">
    <div class="col-12">
      {#if loadingCreateUsers}
        <div class="text-left">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      {:else}
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleCreateUsersFromFirebaseClick}>Create users from
          firebase</button>
      {/if}
    </div>
  </div>
</div>

{#if loading}
  <div class="text-center">
    <br/>
    <div class="spinner-border text-dark" role="status">
      <span class="sr-only">Loading...</span>
    </div>
  </div>
{:else}
  <Grid
    title={''}
    {columns}
    rows={companies}
    limit={10}
    actions={['init-update-company']}
    on:message={handleMessage} />
{/if}

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
        <label for="website">Company website</label>
        <textarea
          type="text"
          class="form-control"
          name="website"
          id="website"
          rows="3"
          bind:value={current.website} />
        {#if errors.website}
          <span class="validation">{errors.website}</span>
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
            <span>Update</span>
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

<Toast />
