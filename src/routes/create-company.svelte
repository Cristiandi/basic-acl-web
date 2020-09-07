<script>
  import { user as userFromStore } from "../common/store.js";
  import { onMount } from "svelte";
  import { goto } from "@sapper/app";

  import { companiesService } from "../modules/companies/companies.service.js";

  import { extractErrors, getFromObjectPathParsed } from "../common/utils.js";

  import { createSchema } from "../modules/companies/schemas/create.schema.js";

  let company = {};

  let successful = true;
  let errors = {};
  let message = "";

  onMount(async () => {
    if ($userFromStore) {
      await goto("/dashboard");
    }
  });

  async function handleSubmit(event) {
    errors = {};
    message = "";

    try {
      if (!company.serviceAccountString) {
        throw new Error("serviceAccount is required.");
      }

      company.serviceAccount = JSON.parse(company.serviceAccountString);

      if (!company.firebaseConfigString) {
        throw new Error("firebaseConfig is required.");
      }

      company.firebaseConfig = JSON.parse(company.firebaseConfigString);
    } catch (error) {
      console.error("error", error);
      message = error.message || "something went wrong.";
      return;
    }

    try {
      await createSchema.validate(company, { abortEarly: false });
    } catch (error) {
      errors = {
        ...extractErrors(error),
      };
      return;
    }

    try {
      const result = await companiesService.createCompany(company);
      successful = true;
      message = result.message;
    } catch (error) {
      console.error(error);
      successful = false;
      message = getFromObjectPathParsed(error, "response.data.message");
    }
  }
</script>

<style>
  #main {
    background-image: url("/bg.svg");
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 100% 100%;
  }

  .card-container.card {
    padding: 2rem 2rem;
  }

  .card {
    background-color: #f7f7f7;
    padding: 20px 25px 30px;
    -moz-border-radius: 2px;
    -webkit-border-radius: 2px;
    border-radius: 2px;
    -moz-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    -webkit-box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.3);
  }

  .centered {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
  }

  .validation {
    color: red;
  }

  .links {
    font-size: smaller;
  }
</style>

<svelte:head>
  <title>Create company</title>
</svelte:head>

<div class="container-fluid" id="main">
  <div class="row">
    <div
      class="col-lg-4 offset-lg-4 col-md-6 offset-md-3 col-sm-8 offset-sm-2
        centered">
      <div class="card card-container">
        <form name="form" on:submit|preventDefault={handleSubmit}>
          <h5 class="card-title">Create</h5>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              name="companyName"
              id="companyName"
              placeholder="Company name"
              bind:value={company.name} />
            {#if errors.name}<span class="validation">{errors.name}</span>{/if}
          </div>
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              name="countryCode"
              id="countryCode"
              placeholder="Country code"
              bind:value={company.countryCode} />
            {#if errors.countryCode}
              <span class="validation">{errors.countryCode}</span>
            {/if}
          </div>
          <div class="form-group">
            <textarea
              type="text"
              class="form-control"
              name="serviceAccount"
              id="serviceAccount"
              rows="5"
              placeholder="Put her the service account JSON from firebase"
              bind:value={company.serviceAccountString} />
            {#if errors.serviceAccount}
              <span class="validation">{errors.serviceAccount}</span>
            {/if}
          </div>
          <div class="form-group">
            <textarea
              type="text"
              class="form-control"
              name="firebaseConfig"
              id="firebaseConfig"
              rows="5"
              placeholder="Put her the firebase config JSON"
              bind:value={company.firebaseConfigString} />
            {#if errors.firebaseConfig}
              <span class="validation">{errors.firebaseConfig}</span>
            {/if}
          </div>
          <div class="form-group text-right">
            <button class="btn btn-primary"> <span>Create</span> </button>
          </div>
          {#if message}
            <div class="form-group">
              <div
                class="alert"
                role="alert"
                class:alert-danger={successful === false}
                class:alert-success={successful}>
                {message}
              </div>
            </div>
          {/if}
          <div class="form-group links"><a href="/">Go login</a></div>
        </form>
      </div>
    </div>
  </div>
</div>
