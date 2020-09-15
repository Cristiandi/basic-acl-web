<script>
    import { user as userFromStore } from '../common/store.js';
  
    import { onMount } from 'svelte';
    import { goto } from '@sapper/app';
  
    import Grid from '../components/Grid/Grid.svelte';
    import Modal from '../components/Modal/Modal.svelte';
  
    import { projectService } from '../modules/projects/project.service';
  
    import { extractErrors, getFromObjectPathParsed } from '../common/utils.js';
  
    import { createSchema } from '../modules/projects/schemas/create.schema';
    import { updateSchema } from '../modules/projects/schemas/update.schema.js';
  
    let projects = [];
  
    $: columns = projects.length
      ? Object.keys(projects[0]).filter((key) => key !== '')
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
  
      if (action === 'init-create-project') {
        initCreate();
      } else if (action === 'init-update-project') {
        initUpdate(row);
      } else if (action === 'init-delete-project') {
        initDelete(row);
      }
    }
  
    async function loadData() {
      const data = await projectService.getProjects();
  
      return data;
    }
  
    function initCreate() {
      isCreateModalOpen = true;
    }
  
    function initUpdate(row) {
      current = {
        ...row
      };
      console.log('current in updte', current);
      isUpdateModalOpen = true;
    }
  
    function initDelete(row) {
      current = row;
      console.log('current in delete', current);
      isDeteleModalOpen = true;
    }
  
    async function handleSubmitCreate(event) {
      errors = {};
      message = '';
  
      try {
        await createSchema.validate(current, { abortEarly: false });
      } catch (error) {
        errors = { ...extractErrors(error) };
        console.log(error);
        return;
      }
      
      console.log('HI');

      try {
        await projectService.createProject(current);
        projects = await loadData();
        isCreateModalOpen = false;
        current = {};
      } catch (error) {
        message = getFromObjectPathParsed(error, 'response.data.message');
      }
    }
  
    async function handleSubmitUpdate(event) {
      errors = {};
      message = '';
  
      try {
        await updateSchema.validate(current, { abortEarly: false });
      } catch (error) {
        errors = { ...extractErrors(error) };
        return;
      }
  
      try {
        await projectService.updateProject(current);
        projects = await loadData();
        isUpdateModalOpen = false;
        current = {};
      } catch (error) {
        message = getFromObjectPathParsed(error, 'response.data.message');
      }
    }
  
    async function handleSubmitDelete(event) {
      errors = {};
      message = '';
  
      try {
        await projectService.removeProject(current);
        projects = await loadData();
        isDeteleModalOpen = false;
        current = {};
      } catch (error) {
        message = getFromObjectPathParsed(error, 'response.data.message');
      }
    }
  
    onMount(async () => {
      if (!$userFromStore) {
        await goto('/');
      }
  
      projects = await loadData();
    });
  </script>
  
  <style>
    .validation {
      color: red;
    }
  </style>
  
  <Grid
    title={'Projects'}
    {columns}
    rows={projects}
    limit={10}
    actions={['init-create-project', 'init-update-project', 'init-delete-project']}
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
          <label for="code">Code</label>
          <input
            type="text"
            class="form-control"
            name="code"
            id="code"
            bind:value={current.code} />
          {#if errors.code}<span class="validation">{errors.code}</span>{/if}
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
          <label for="code">Code</label>
          <input
            type="text"
            class="form-control"
            name="code"
            id="code"
            bind:value={current.code} />
          {#if errors.code}<span class="validation">{errors.code}</span>{/if}
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
  