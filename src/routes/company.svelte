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

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { updateSchema } from '../modules/companies/schemas/update.schema.js';

  let companies = [];

  const notShowInColumns = ['serviceAccount', 'firebaseConfig'];
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
      serviceAccountString: row.serviceAccount
        ? JSON.stringify(row.serviceAccount)
        : '',
      firebaseConfigString: row.firebaseConfig
        ? JSON.stringify(row.firebaseConfig)
        : '',
    };
    console.log('current in updte', current);
    isUpdateModalOpen = true;
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = '';
    loadingModal = true;

    try {
      if (!current.serviceAccountString) {
        throw new Error('serviceAccount is required.');
      }

      current.serviceAccount = JSON.parse(current.serviceAccountString);

      if (!current.firebaseConfigString) {
        throw new Error('firebaseConfig is required.');
      }

      current.firebaseConfig = JSON.parse(current.firebaseConfigString);
    } catch (error) {
      console.error('error', error);
      message = error.message || 'something went wrong.';
      loadingModal = false;
      return;
    }

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
      message = getFromObjectPathParsed(error, 'response.data.message');
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
      localMessage = getFromObjectPathParsed(error, 'response.data.message');

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
        <label for="countryCode">Country code</label>
        <input
          type="text"
          class="form-control"
          name="countryCode"
          id="countryCode"
          bind:value={current.countryCode} />
        {#if errors.countryCode}
          <span class="validation">{errors.countryCode}</span>
        {/if}
      </div>
      <div class="form-group">
        <label class="form-check-label" for="enable">Confirmation email config</label>
        <input
          type="checkbox"
          class="form-control"
          name="enable"
          id="enable"
          bind:value={current.confirmationEmailConfig}
          bind:checked={current.confirmationEmailConfig} />
        {#if errors.confirmationEmailConfig}<span class="validation">{errors.confirmationEmailConfig}</span>{/if}
      </div>
      <div class="form-group">
        <label for="serviceAccount">Service account</label>
        <textarea
          type="text"
          class="form-control"
          name="serviceAccount"
          id="serviceAccount"
          rows="5"
          bind:value={current.serviceAccountString} />
        {#if errors.serviceAccount}
          <span class="validation">{errors.serviceAccount}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="firebaseConfig">Firebase config</label>
        <textarea
          type="text"
          class="form-control"
          name="firebaseConfig"
          id="firebaseConfig"
          rows="5"
          bind:value={current.firebaseConfigString} />
        {#if errors.firebaseConfig}
          <span class="validation">{errors.firebaseConfig}</span>
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
