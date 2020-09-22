<script>
  import { user as userFromStore } from "../common/store.js";

  import Select from 'svelte-select';
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";

  import { httpRouteService } from "../modules/http-routes/http-route.service";
  import { projectService } from "../modules/projects/project.service";

  import { extractErrors, getFromObjectPathParsed } from "../common/utils.js";

  import { createSchema } from "../modules/http-routes/schemas/create.schema";
  import { updateSchema } from "../modules/http-routes/schemas/update.schema.js";

  let items = [];
  let projectsList = [];

  $: columns = items.length
    ? Object.keys(items[0]).filter((key) => key !== "")
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

    if (action === "init-create-http_route") {
      initCreate();
    } else if (action === "init-update-http_route") {
      initUpdate(row);
    } else if (action === "init-delete-http_route") {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await httpRouteService.findAll();

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
        label: row.projectName
      }
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
    message = "";

    try {
      current.projectId = current.project ? current.project.value : current.project;
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      console.log(error);
      return;
    }

    try {
      await httpRouteService.create(current);
      items = await loadData();
      isCreateModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }

  async function handleSubmitUpdate(event) {
    errors = {};
    message = "";

    try {
      current.projectId = current.project ? current.project.value : current.project;
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      return;
    }

    try {
      await httpRouteService.update(current);
      items = await loadData();
      isUpdateModalOpen = false;
      current = {};
    } catch (error) {
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }

  async function handleSubmitDelete(event) {
    errors = {};
    message = "";

    try {
      await httpRouteService.remove(current);
      items = await loadData();
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

    items = await loadData();
    projectsList = await loadProjectsList();
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<Grid
  title={'Http routes'}
  {columns}
  rows={items}
  limit={10}
  actions={['init-create-http_route', 'init-update-http_route', 'init-delete-http_route']}
  on:message={handleMessage} />

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
        <label for="method">Method</label>
        <input
          type="text"
          class="form-control"
          name="method"
          id="method"
          bind:value={current.method} />
        {#if errors.method}<span class="validation">{errors.method}</span>{/if}
      </div>
      <div class="form-group">
        <label for="path">Path</label>
        <input
          type="text"
          class="form-control"
          name="path"
          id="path"
          bind:value={current.path} />
        {#if errors.path}<span class="validation">{errors.path}</span>{/if}
      </div>
      <div class="form-group">
        <label for="project">Project</label>
        <Select name="project" items={projectsList} bind:selectedValue={current.project} />
        {#if errors.projectId}<span class="validation">{errors.projectId}</span>{/if}
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
        <label for="method">Method</label>
        <input
          type="text"
          class="form-control"
          name="method"
          id="method"
          bind:value={current.method} />
        {#if errors.method}<span class="validation">{errors.method}</span>{/if}
      </div>
      <div class="form-group">
        <label for="path">Path</label>
        <input
          type="text"
          class="form-control"
          name="path"
          id="path"
          bind:value={current.path} />
        {#if errors.path}<span class="validation">{errors.path}</span>{/if}
      </div>
      <div class="form-group">
        <label for="project">Project</label>
        <Select name="project" items={projectsList} bind:selectedValue={current.project} />
        {#if errors.projectId}<span class="validation">{errors.projectId}</span>{/if}
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
