<script>
  import { user as userFromStore } from "../common/store.js";

  import Select from "svelte-select";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import Grid from "../components/Grid/Grid.svelte";
  import Modal from "../components/Modal/Modal.svelte";

  import { assignedRoleService } from "../modules/assigned-roles/assigned-role.service";
  import { roleService } from "../modules/roles/role.service";
  import { userService } from "../modules/users/users.service";

  import { extractErrors, getMessageFromGraphQLError } from "../common/utils.js";

  import { createSchema } from "../modules/assigned-roles/schemas/create.schema";

  let items = [];
  let rolesList = [];
  let usersList = [];

  const notShowInColumns = ["roleId", "roleUid", "userId", "userAuthUid"];
  $: columns = items.length
    ? Object.keys(items[0]).filter((key) => !notShowInColumns.includes(key))
    : [];

  let current = {};
  let errors = {};
  let message = "";
  let loading = false;
  let loadingModal = false;

  let isCreateModalOpen = false;
  let isDeteleModalOpen = false;

  function handleMessage(event) {
    const { detail } = event;

    const { action, row } = detail;

    if (action === "init-create-assigned_role") {
      initCreate();
    } else if (action === "init-delete-assigned_role") {
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
      value: item.uid,
      label: `${item.code} - ${item.name}`,
    }));
  }

  async function loadUsersList() {
    const data = await userService.findAll();

    return data.map((item) => ({
      value: item.authUid,
      label: item.email || item.phone,
    }));
  }

  function initCreate() {
    isCreateModalOpen = true;
  }

  function initDelete(row) {
    current = row;
    console.log("current in delete", current);
    isDeteleModalOpen = true;
  }

  function handleRoleSelect(event) {
    current.role = event.detail;
  }

  function handleUserSelect(event) {
    current.user = event.detail;
  }

  async function handleSubmitCreate(event) {
    errors = {};
    message = "";
    loadingModal = true;

    console.log("current", current);

    try {
      current.roleUid = current.role ? current.role.value : current.role;
      current.userUid = current.user ? current.user.value : current.user;
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
      message = getMessageFromGraphQLError(error);
    }

    loadingModal = false;
  }

  async function handleSubmitDelete(event) {
    errors = {};
    message = "";
    loadingModal = true;

    try {
      await assignedRoleService.remove(current);
      items = await loadData();
      isDeteleModalOpen = false;
      current = {};
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

    items = await loadData();
    rolesList = await loadRolesList();
    usersList = await loadUsersList();

    loading = false;
  });
</script>

<svelte:head>
  <title>Assigned roles</title>
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
    title={"Assigned roles"}
    {columns}
    rows={items}
    limit={10}
    actions={["init-create-assigned_role", "init-delete-assigned_role"]}
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
        <label for="role">Role</label>
        <Select
          items={rolesList}
          on:select={handleRoleSelect}
        />
        {#if errors.roleUid}<span class="validation">{errors.roleUid}</span>{/if}
      </div>
      <div class="form-group">
        <label for="user">User</label>
        <Select
          items={usersList}
          on:select={handleUserSelect}
        />
        {#if errors.userUid}<span class="validation">{errors.userUid}</span>{/if}
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

<style>
  .validation {
    color: red;
  }
</style>
