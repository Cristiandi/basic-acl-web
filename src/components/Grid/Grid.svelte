<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "svelte-awesome/components/Icon.svelte";
  import {
    plus as plusIcon,
    pencil as penIcon,
    times as timesIcom,
  } from "svelte-awesome/icons";

  const dispatch = createEventDispatcher();

  export let columns = [];
  export let rows = [];
  export let limit = 10;
  export let actions = [];

  let filterKey = "";
  let sortKey = "";
  let currentPage = 1;
  let skip = 0;

  let filteredRows = [];
  $: {
    filteredRows = rows;

    if (filterKey) {
      filteredRows = rows.filter((row) => {
        return Object.keys(row).some((key) => {
          console.log(
            String(row[key]).toLowerCase().indexOf(filterKey),
            "test"
          );
          return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
        });
      });
    }

    if (sortKey) {
      filteredRows = rows.slice().sort((a, b) => {
        a = a[sortKey];
        b = b[sortKey];
        return (a === b ? 0 : a > b ? 1 : -1) * 1;
      });
    }

    filteredRows = filteredRows.slice(skip, skip + limit);
  }

  $: createAction = actions.reduce((pre, cur) => {
    console.log(cur, "cur", cur.includes("create"));
    if (cur.includes("create")) {
      console.log("sizas");
      return cur;
    } else return pre;
  }, "");

  function handleDispatch(action, row) {
    console.log(createAction, "createAction");
    dispatch("message", {
      action,
      row,
    });
  }
</script>

<div class="container">
  <div class="row">
    <div class="col-sm-12 col-md-4">
      <div class="form-group">
        <input
          type="text"
          class="form-control"
          name="filterInput"
          id="filterInput"
          bind:value={filterKey} />
      </div>
    </div>
    <div class="col-sm-12 col-md-4">
      <div class="form-group">
        <select class="custom-select" bind:value={sortKey}>
          {#each columns as column}
            <option value={column}>{column}</option>
          {/each}
        </select>
      </div>
    </div>
    {#if createAction}
      <div class="col-sm-12 col-md-4">
        <div class="form-group">
          <button type="button" class="btn btn-block btn-primary" on:click={handleDispatch(createAction, {})}>
            <Icon data={plusIcon} scale={1} />
          </button>
        </div>
      </div>
    {/if}
    <div class="col-12">
      <table class="table table-responsive-sm table-borderless table-striped">
        <thead>
          <tr>
            {#each columns as column}
              <th class="text-center">{column}</th>
            {/each}
            {#if actions.length}
              <th class="text-center">actions</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each filteredRows as row}
            <tr>
              {#each columns as column}
                <td class="text-center"><span>{row[column]}</span></td>
              {/each}
              {#if actions.length}
                <td>
                  <div class="text-center">
                    {#each actions as action}
                      {#if !action.includes('create')}
                        <span>
                          <button
                            type="button"
                            class="btn btn-secondary btn-sm"
                            on:click={handleDispatch(action, row)}>
                            {#if action.includes('update')}
                              <Icon data={penIcon} scale={1} />
                            {:else if action.includes('delete')}
                              <Icon data={timesIcom} scale={1} />
                            {:else}{action}{/if}
                          </button>
                        </span>
                      {/if}
                    {/each}
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
