<script>
  import { user as userFromStore } from "../common/store.js";

  import Select from "svelte-select";

  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";

  import { emailTemplateService } from "../modules/email-templates/email-template.service";

  import {
    extractErrors,
    getMessageFromGraphQLError,
  } from "../common/utils.js";

  import { createSchema } from "../modules/email-templates/schemas/create.schema";
  import { updateSchema } from "../modules/email-templates/schemas/update.schema";

  let emailTemplates = [];

  const notShowInColumns = ["uid"];
  $: columns = emailTemplates.length
    ? Object.keys(emailTemplates[0]).filter(
        (key) => !notShowInColumns.includes(key)
      )
    : [];

  let current = {};
  let errors = {};
  let message = "";
  let loading = false;
  let loadingModal = false;

  let isCreateModalOpen = false;
  let isUpdateModalOpen = false;
  let isDeteleModalOpen = false;
  let isPreviewModalOpen = false;

  const typeList = [
    {
      value: "WELCOME_EMAIL",
      label: "WELCOME_EMAIL",
    },
    {
      value: "CONFIRMATION_EMAIL",
      label: "CONFIRMATION_EMAIL",
    },
    {
      value: "RESET_PASSWORD_EMAIL",
      label: "RESET_PASSWORD_EMAIL",
    },
    {
      value: "PASSWORD_UPDATED_EMAIL",
      label: "PASSWORD_UPDATED_EMAIL",
    },
    {
      value: "SUPER_ADMIN_CONFIRMATION_EMAIL",
      label: "SUPER_ADMIN_CONFIRMATION_EMAIL",
    },
  ];

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === "init-create-email_template") {
      initCreate();
    } else if (action === "init-update-email_template") {
      initUpdate(row);
    } else if (action === "init-delete-email_template") {
      initDelete(row);
    } else if (action === "init-preview-email_template") {
      initPreview(row);
    }
  }

  async function loadData() {
    const data = await emailTemplateService.findAll();

    return data;
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
    };
    console.log("current in updte", current);
    isUpdateModalOpen = true;
  }

  function initDelete(row) {
    current = row;
    console.log("current in delete", current);
    isDeteleModalOpen = true;
  }

  function initPreview(row) {
    current = row;
    current.preview = '';
    console.log("current in preview", current);
    isPreviewModalOpen = true;
  }

  function handleTypeSelect(event) {
    current.type = event.detail.value;
  }

  async function handleSubmitCreate(event) {
    errors = {};
    message = "";
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
      let file;
      if (current.file) {
        file = document.getElementById("file").files[0];
      }

      await emailTemplateService.create({
        ...current,
        file,
      });

      emailTemplates = await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitUpdate(event) {
    console.log("current in update", current);
    errors = {};
    message = "";
    loadingModal = true;

    try {
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      loadingModal = false;
      return;
    }

    try {
      let file;
      if (current.file) {
        file = document.getElementById("file").files[0];
      }

      await emailTemplateService.update({
        ...current,
        file,
      });
      
      emailTemplates = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitDelete(event) {
    errors = {};
    message = "";
    loadingModal = true;

    try {
      await emailTemplateService.remove(current);
      emailTemplates = await loadData();
      isDeteleModalOpen = false;
      current = {};
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitPreview(event) {
    errors = {};
    message = "";
    loadingModal = true;

    // parse the current.parameters into an object
    let parsedParameters = {};

    if (current.parameters) {
      try {
        parsedParameters = JSON.parse(current.parameters);
      } catch (error) {
        errors.parameters = "Invalid JSON";
        loadingModal = false;
        return;
      }
    }

    try {
      const { html } = await emailTemplateService.preview({...current, parameters: parsedParameters});

      current = {};
      
      current.preview = html;
    } catch (error) {
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  onMount(async () => {
    if (!$userFromStore) {
      await goto("/");
    }
    loading = true;
    emailTemplates = await loadData();
    loading = false;
  });
</script>

<svelte:head>
  <title>Email templates</title>
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
    title={"Email templates"}
    {columns}
    rows={emailTemplates}
    limit={10}
    actions={[
      "init-create-email_template",
      "init-update-email_template",
      "init-delete-email_template",
      "init-preview-email_template",
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
        <label for="code">Type</label>
        <Select items={typeList} on:select={handleTypeSelect} />
        {#if errors.type}<span class="validation">{errors.type}</span>{/if}
      </div>
      <div class="form-group">
        <label for="subject">Subject</label>
        <input
          type="text"
          class="form-control"
          name="subject"
          id="subject"
          bind:value={current.subject}
        />
        {#if errors.subject}<span class="validation">{errors.subject}</span
          >{/if}
      </div>
      <div class="form-group">
        <label for="fle">Template</label>
        <input
          type="file"
          class="form-control"
          name="file"
          id="file"
          bind:value={current.file}
        />
        {#if errors.file}<span class="validation">{errors.file}</span>{/if}
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
        <label for="type">Type</label>
        <Select items={typeList} on:select={handleTypeSelect} />
        {#if errors.type}<span class="validation">{errors.type}</span>{/if}
      </div>
      <div class="form-group">
        <label for="subject">Subject</label>
        <input
          type="text"
          class="form-control"
          name="subject"
          id="subject"
          bind:value={current.subject}
        />
        {#if errors.subject}
          <span class="validation">{errors.subject}</span>
        {/if}
      </div>
      <div class="form-group">
        <label for="fle">Template</label>
        <input
          type="file"
          class="form-control"
          name="file"
          id="file"
          bind:value={current.file}
        />
        {#if errors.file}<span class="validation">{errors.file}</span>{/if}
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

<Modal bind:isOpen={isPreviewModalOpen}>
  <div slot="header">
    <h3>Preview</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitPreview}>
      <div class="form-group">
        <label for="parameters">Parameters</label>
        <textarea
          type="text"
          rows="5"
          class="form-control"
          name="parameters"
          id="parameters"
          placeholder="Put here the parameters in JSON format"
          bind:value={current.parameters}
        />
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
            <span>Preview</span>
          </button>
        </div>
      {/if}
      {#if message}
        <div class="form-group">
          <div class="alert alert-danger" role="alert">{message}</div>
        </div>
      {/if}
    </form>
    <div class="form-group">
      {@html current.preview}
    </div>
  </div>
</Modal>

<style>
  .validation {
    color: red;
  }
</style>
