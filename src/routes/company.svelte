<script>
  import { user as userFromStore } from '../common/store.js';

  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';

  import Grid from '../components/Grid/Grid.svelte';
  import Modal from '../components/Modal/Modal.svelte';

  import { companiesService } from '../modules/companies/companies.service.js';

  import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';

  import { createSchema } from '../modules/companies/schemas/create.schema.js';
  import { updateSchema } from '../modules/companies/schemas/update.schema.js';

  let companies = [];

  const notShowInColumns = ['serviceAccount', 'firebaseConfig'];
  $: columns = companies.length
    ? Object.keys(companies[0]).filter((key) => !notShowInColumns.includes(key))
    : [];

  let current = {};
  let errors = {};
  let message = '';

  let isCreateModalOpen = false;
  let isUpdateModalOpen = false;
  let isDeteleModalOpen = false;

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
      serviceAccountString: row.serviceAccount ?
        JSON.stringify(row.serviceAccount) :
        '',
      firebaseConfigString: row.firebaseConfig ?
        JSON.stringify(row.firebaseConfig) :
        ''
    };
    console.log('current in updte', current);
    isUpdateModalOpen = true;
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = '';

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
      return;
    }

    try {
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
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
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }

    companies = await loadData();
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<Grid
  title={'Companies'}
  {columns}
  rows={companies}
  limit={10}
  actions={['init-update-company']}
  on:message={handleMessage} />

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
      <div class="form-group">
        <button class="btn btn-primary btn-block"> <span>Update</span> </button>
      </div>
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
  </div>
</Modal>
