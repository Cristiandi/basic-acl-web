<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "svelte-awesome/components/Icon.svelte";
  import Select from "svelte-select";
  import {
    plus as plusIcon,
    pencil as penIcon,
    times as timesIcom,
  } from "svelte-awesome/icons";

  const dispatch = createEventDispatcher();

  export let title = "Default";
  export let columns = [];
  export let rows = [];
  export let limit = 10;
  export let actions = [];

  let filterKey = "";
  let sortKey = undefined;
  const firtsPageNumber = 1;
  let currentPage = firtsPageNumber;
  let skip = 0;

  let filteredRows = [];
  $: {
    filteredRows = rows;

    if (filterKey) {
      filteredRows = rows.filter((row) => {
        return Object.keys(row).some((key) => {
          return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
        });
      });
    }

    if (sortKey) {
      const valueToSort = sortKey.value;
      filteredRows = rows.slice().sort((a, b) => {
        a = a[valueToSort];
        b = b[valueToSort];
        return (a === b ? 0 : a > b ? 1 : -1) * 1;
      });
    }

    filteredRows = filteredRows.slice(skip, skip + limit);
  }

  let pagination = [];
  $: {
    const totalRows = rows.length;
    const pagesNumber = Math.ceil(totalRows / limit);

    let paginationArrray = [];
    for (let i = 0; i < pagesNumber; i++) {
      const toSkip = paginationArrray[paginationArrray.length - 1]
        ? paginationArrray[paginationArrray.length - 1].skip + limit
        : 0;

      const pageNumber = paginationArrray.length + 1;

      paginationArrray = [
        ...paginationArrray,
        { limit, skip: toSkip, pageNumber },
      ];
    }

    pagination = paginationArrray;
  }

  $: lastPageNumber = pagination.length
    ? pagination[pagination.length - 1].pageNumber
    : 0;

  $: createAction = actions.reduce((pre, cur) => {
    if (cur.includes("create")) {
      return cur;
    } else return pre;
  }, "");

  function handlePageClick(pageNumber = 1) {
    const askedPage = pagination[pageNumber - 1];
    if (!askedPage) return;
    limit = askedPage.limit;
    skip = askedPage.skip;
    currentPage = askedPage.pageNumber;
  }

  function handleDispatch(action, row) {
    dispatch("message", {
      action,
      row: { ...row },
    });
  }
</script>

<div class="container">
  <div class="row">
    <div class="col-12">
      <h1>{title}</h1>
    </div>
    <div class="col-sm-12 col-md-4">
      <div class="form-group">
        <input
          type="text"
          class="form-control"
          name="filterInput"
          id="filterInput"
          placeholder="Filter..."
          bind:value={filterKey} />
      </div>
    </div>
    <div class="col-sm-12 col-md-4">
      <div class="form-group">
        <Select items={columns} bind:selectedValue={sortKey} />
      </div>
    </div>
    {#if createAction}
      <div class="col-sm-12 col-md-4">
        <div class="form-group">
          <button
            type="button"
            class="btn btn-block btn-primary"
            on:click={handleDispatch(createAction, {})}>
            <Icon data={plusIcon} scale={1} />
          </button>
        </div>
      </div>
    {/if}
    <div class="col-12" style="overflow-x:auto;">
      {#if !rows.length}
        <h3>NO ROWS</h3>
      {:else}
        <table class="table table-responsive-sm table-borderless table-striped">
          <thead>
            <tr>
              {#each columns as column}
                <th class="text-center">{column.toUpperCase()}</th>
              {/each}
              {#if actions.length}
                <th class="text-center">ACTIONS</th>
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
        {#if pagination.length}
          <div class="d-flex justify-content-center">
            <ul class="pagination">
              <li class="page-item">
                <div
                  class="page-link"
                  aria-label="Previous"
                  on:click={handlePageClick(firtsPageNumber)}>
                  <span aria-hidden="true">&laquo;</span>
                  <span class="sr-only">Previous</span>
                </div>
              </li>
              {#each pagination as page}
                <li
                  class="page-item"
                  class:active={currentPage === page.pageNumber}>
                  <div
                    class="page-link"
                    on:click={handlePageClick(page.pageNumber)}>
                    {page.pageNumber}
                  </div>
                </li>
              {/each}
              <li class="page-item">
                <div
                  class="page-link"
                  aria-label="Next"
                  on:click={handlePageClick(lastPageNumber)}>
                  <span aria-hidden="true">&raquo;</span>
                  <span class="sr-only">Next</span>
                </div>
              </li>
            </ul>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>
