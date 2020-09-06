<script>
  export let status;
  export let error;

  const dev = process.env.NODE_ENV === 'development';
</script>

<style>
  .error-main {
    background-color: #fff;
    box-shadow: 0px 10px 10px -10px #5d6572;
  }
  .error-main h1 {
    font-weight: bold;
    color: #444444;
    font-size: 100px;
    text-shadow: 2px 4px 5px #6e6e6e;
  }
  .error-main h6 {
    color: #42494f;
  }
  .error-main p {
    color: #9897a0;
    font-size: 14px;
  }
</style>

<svelte:head>
  <title>Error - {status}</title>
</svelte:head>

<div class="container">
  <div class="row text-center">
    <div
      class="col-lg-6 offset-lg-3 col-sm-6 offset-sm-3 col-12 p-3 error-main">
      <div class="row">
        <div class="col-lg-8 col-12 col-sm-10 offset-lg-2 offset-sm-1">
          <h1 class="m-0">{status}</h1>
          <h6>{error.message}</h6>
          <p>
            Lorem ipsum dolor sit <span class="text-info">amet</span>,
            consectetur <span class="text-info">adipisicing</span> elit, sed do eiusmod.
					</p>
					
					{#if dev && error.stack}
            <pre>{error.stack}</pre>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
