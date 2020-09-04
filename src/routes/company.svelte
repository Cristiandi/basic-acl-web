<script context="module">
  import { companiesService } from "../modules/companies/companies.service.js";

  export async function preload(page, session) {
    try {
      const companies = await companiesService.getCompanies();

      return { companies };
    } catch (error) {
      this.error(500, error.message);
    }
  }
</script>

<script>
  import { user as userFromStore } from '../common/store.js';
  import { onMount } from 'svelte';
  import { goto } from '@sapper/app';
  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";
  import { extractErrors } from "../common/utils.js";
  import { createSchema } from '../modules/companies/schemas/create.schema.js';

  export let companies;

  const columns = Object.keys(companies[0]);
  
  let current = {};
  let errors = {};
  let message = '';

  let isCreateModalOpen = false;

  async function loadData() {
    try {
      companies = await companiesService.getCompanies();
    } catch (error) {
      this.error(500, error.message);
    }
  }

  function handleMessage(event) {
    const { detail } = event;

    const { action } = detail;

    if (action === "init-create-company") {
      initCreateCompany();
    }
  }

  function initCreateCompany() {
    isCreateModalOpen = true;
  }

  async function handleSubmitCreate(event) {
    console.log(current, 'current');

    errors = {};

    try {
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      return;
    }

    try {
      await companiesService.createCompany(current);
      await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {
      console.log('error', error);
      message = error.message || 'something went wrong.';
    }
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto('/');
    }
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<h1>Companies</h1>

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
        <label for="uuid">UUID</label>
        <input
          minlength="5"
          maxlength="100"
          type="text"
          class="form-control"
          name="uuid"
          id="uuid"
          bind:value={current.uuid} />
        {#if errors.uuid}
          <span class="validation">{errors.uuid}</span>
        {/if}
      </div>
      <div class="form-group">
        <button class="btn btn-primary btn-block">
          <span>Crear</span>
        </button>
      </div>
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
  </div>
</Modal>

<Grid
  {columns}
  rows={companies}
  actions={['init-create-company', 'init-update-company', 'init-delete-company']}
  on:message={handleMessage} />
