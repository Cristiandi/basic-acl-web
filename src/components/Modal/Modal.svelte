<script>
  export let isOpen = false;
</script>

<style>
  div.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
  }

  div.modal:not(:focus-within) {
    transition: opacity 0.1ms;
    opacity: 0.99;
  }

  div.backdrop {
    background-color: rgba(0, 0, 0, 0.4);
    position: absolute;
    width: 100%;
    height: 100%;
  }

  div.content-wrapper {
    z-index: 10;
    max-width: 70vw;
    border-radius: 0.3rem;
    background-color: white;
    overflow: hidden;
  }

  div.content {
    max-height: 50vh;
    overflow: auto;
  }

  h1 {
    opacity: 0.5;
  }

  /* Extra small devices (phones, 600px and down) */
  @media (max-width: 600px) {
    div.content-wrapper {
      width: 100vw;
    }
  }

  /* Small devices (portrait tablets and large phones, 600px and up) */
  @media (min-width: 600px) {
    div.content-wrapper {
      width: 80vw;
    }
  }

  /* Medium devices (landscape tablets, 768px and up) */
  @media (min-width: 768px) {
    div.content-wrapper {
      width: 50vw;
    }
  }

  /* Large devices (laptops/desktops, 992px and up) */
  @media (min-width: 992px) {
    div.content-wrapper {
      width: 40vw;
    }
  }

  /* Extra large devices (large laptops and desktops, 1200px and up) */
  @media (min-width: 1200px) {
    div.content-wrapper {
      width: 30vw;
    }
  }
</style>

<!-- if you're not using typescript, remove lang="ts" attribute from the script tag -->
{#if isOpen}
  <div class="modal" tabindex="0">
    <div class="backdrop" on:click={(e) => (isOpen = false)} />

    <div class="content-wrapper">
      <div class="modal-header">
        <slot name="header">
          <!-- fallback -->
          <div>
            <h1>Your Modal Heading Goes Here...</h1>
          </div>
        </slot>
      </div>

      <div class="content modal-body">
        <slot name="content" />
      </div>

      <slot name="footer">
        <!-- fallback -->
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            on:click={(e) => (isOpen = false)}>Close</button>
        </div>
      </slot>
    </div>
  </div>
{/if}
