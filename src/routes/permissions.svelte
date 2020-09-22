<script>
  import { user as userFromStore } from "../common/store.js";

  import Select from 'svelte-select';
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";

  import { permissionService } from "../modules/permissions/permission.service";
  import { roleService } from "../modules/roles/role.service";
  import { httpRouteService } from "../modules/http-routes/http-route.service";

  import { extractErrors, getFromObjectPathParsed } from "../common/utils.js";

  import { createSchema } from "../modules/permissions/schemas/create.schema";
  import { updateSchema } from "../modules/permissions/schemas/update.schema.js";

  let items = [];
  let rolesList = [];
  let httpRoutesList = [];

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

    if (action === "init-create-permission") {
      initCreate();
    } else if (action === "init-update-permission") {
      initUpdate(row);
    } else if (action === "init-delete-permission") {
      initDelete(row);
    }
  }

  async function loadData() {
    const data = await permissionService.findAll();

    return data;
  }

  async function loadRolesList() {
    const data = await roleService.findAll();

    return data.map((item) => ({ value: item.id, label: item.name }));
  }

  async function loadHttpRoutesList() {
    const data = await httpRouteService.findAll();

    return data.map((item) => ({ value: item.id, label: item.name }));
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initUpdate(row) {
    current = {
      ...row,
      role: {
        value: row.roleId,
        label: row.roleName
      },
      httpRoute: {
        value: row.httpRouteId,
        label: row.httpRouteName
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
      current.roleId = current.role ? current.role.value : current.role;
      current.httpRouteId = current.httpRoute ? current.httpRoute.value : current.httpRoute;
      await createSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      console.log(error);
      return;
    }

    try {
      await permissionService.create(current);
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
      current.roleId = current.role ? current.role.value : current.role;
      current.httpRouteId = current.httpRoute ? current.httpRoute.value : current.httpRoute;
      await updateSchema.validate(current, { abortEarly: false });
    } catch (error) {
      errors = { ...extractErrors(error) };
      return;
    }

    try {
      await permissionService.update(current);
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
      await permissionService.remove(current);
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
    rolesList = await loadRolesList();
    httpRoutesList = await loadHttpRoutesList();
  });
</script>

<style>
  .validation {
    color: red;
  }
</style>

<Grid
  title={'Permissions'}
  {columns}
  rows={items}
  limit={10}
  actions={['init-create-permission', 'init-update-permission', 'init-delete-permission']}
  on:message={handleMessage} />

<Modal bind:isOpen={isCreateModalOpen}>
  <div slot="header">
    <h3>Create</h3>
  </div>
  <div slot="content">
    <form name="form" on:submit|preventDefault={handleSubmitCreate}>
      <div class="form-group">
        <label class="form-check-label" for="allowed">Allowed</label>
        <input
            type="checkbox"
            class="form-control"
            name="allowed"
            id="allowed"
            bind:value={current.allowed}
            bind:checked={current.allowed} />
        {#if errors.allowed}<span class="validation">{errors.allowed}</span>{/if}
      </div>
      <div class="form-group">
        <label for="role">Role</label>
        <Select items={rolesList} bind:selectedValue={current.role} />
        {#if errors.roleId}<span class="validation">{errors.projectId}</span>{/if}
      </div>
      <div class="form-group">
        <label for="role">Http route</label>
        <Select items={httpRoutesList} bind:selectedValue={current.httpRoute} />
        {#if errors.httpRouteId}<span class="validation">{errors.httpRouteId}</span>{/if}
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
        <label class="form-check-label" for="allowed">Allowed</label>
        <input
            type="checkbox"
            class="form-control"
            name="allowed"
            id="allowed"
            bind:value={current.allowed}
            bind:checked={current.allowed} />
        {#if errors.allowed}<span class="validation">{errors.allowed}</span>{/if}
      </div>
      <div class="form-group">
        <label for="role">Role</label>
        <Select items={rolesList} bind:selectedValue={current.role} />
        {#if errors.roleId}<span class="validation">{errors.projectId}</span>{/if}
      </div>
      <div class="form-group">
        <label for="role">Http route</label>
        <Select items={httpRoutesList} bind:selectedValue={current.httpRoute} />
        {#if errors.httpRouteId}<span class="validation">{errors.httpRouteId}</span>{/if}
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
