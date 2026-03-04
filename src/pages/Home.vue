<script setup>
import { defineComponent, ref } from "vue";
import FriendsAroundMeForm from "../Components/FriendsAroundMeForm.vue";
</script>

<template>
  <div class="home-wrapper">
    <!-- Let them know their data will be deleted -->
    <div class="home-header">
      <h1>Friends Around Me!</h1>
    </div>
    <div class="home-subheader">
      <p>
        Using information about your High School, Mission (if applicable), and
        the languages you speak, we can find friends around you!
      </p>
    </div>
    <div class="form-container">
      <FriendsAroundMeForm />
    </div>
  </div>
</template>

<style scoped>
.home-wrapper {
  padding: 2em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home-header {
  text-align: center;
  margin-top: 1.5em;
  font-size: 2.5em;
  color: var(--color-primary);

  @media (max-width: 450px) {
    font-size: 1.8em;
  }
}

.home-subheader {
  text-align: center;
  margin-bottom: 2em;
  color: var(--color-primary-700);
  max-width: 40em;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 450px) {
    max-width: 90%;
  }
}

.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 90%;

  @media (max-width: 400px) {
  }
}
</style>
