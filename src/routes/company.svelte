<script>
  import { onMount } from "svelte";
  import { goto } from "@sapper/app"

  import { user as userFromStore } from "../common/store.js";;

  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";

  import { companiesService } from "../modules/companies/companies.service.js";
  
  import { extractErrors, getFromObjectPathParsed } from "../common/utils.js";

  import { createSchema } from "../modules/companies/schemas/create.schema.js";
  import { updateSchema } from "../modules/companies/schemas/update.schema.js";

  let companies = [];

  $: columns = companies.length
    ? Object.keys(companies[0]).filter((key) => key !== "serviceAccount")
    : [];

  let current = {};
  let errors = {};
  let message = "";

  let isCreateModalOpen = false;
  let isUpdateModalOpen = false;
  let isDeteleModalOpen = false;

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === "init-create-company") {
      initCreate();
    } else if (action === "init-update-company") {
      initUpdate(row);
    } else if (action === "init-delete-company") {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await companiesService.getCompanies();

    return data;
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
      serviceAccountString: row.serviceAccount ? JSON.stringify(row.serviceAccount) : ''
    };
    console.log("current in updte", current);
    isUpdateModalOpen = true;
  }

  function initDelete(row) {
    current = row;
    console.log("current in delete", current);
    isDeteleModalOpen = true;
  }

  async function handleSubmitCreate(event) {
    errors = {};
    message = '';

    try {
      if (!current.serviceAccountString) {
        throw new Error("serviceAccount is required.");
      }

      current.serviceAccount = JSON.parse(current.serviceAccountString);
    } catch (error) {
      console.error("error", error);
      message = error.message || "something went wrong.";
      return;
    }

    try {
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      return;
    }

    try {
      delete current.serviceAccountString;
      await companiesService.createCompany(current);
      companies = await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {      
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = '';

    try {
      if (!current.serviceAccountString) {
        throw new Error("serviceAccount is required.");
      }

      current.serviceAccount = JSON.parse(current.serviceAccountString);
    } catch (error) {
      console.error("error", error);
      message = error.message || "something went wrong.";
      return;
    }

    try {
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      return;
    }

    try {
      delete current.serviceAccountString;
      delete current.createdAt;
      delete current.updatedAt;

      const { id } = current;
      delete current.id;
      await companiesService.updateCompany(id, { ...current });
      companies = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {      
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }

  async function handleSubmitDelete(event) {
    try {
      const { id } = current;
      await companiesService.removeCompany(id);
      companies = await loadData();
      isDeteleModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto("/");
    }

    companies = await loadData();
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

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
        <button class="btn btn-primary btn-block"> <span>Create</span> </button>
      </div>
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
        <button class="btn btn-primary btn-block"> <span>update</span> </button>
      </div>
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
      <div class="form-group">
        <button class="btn btn-primary btn-block"> <span>Delete</span> </button>
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
  title={'Companies'}
  {columns}
  rows={companies}
  limit={10}
  actions={['init-create-company', 'init-update-company', 'init-delete-company']}
  on:message={handleMessage} />
