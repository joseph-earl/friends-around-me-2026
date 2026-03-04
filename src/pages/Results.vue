<template>
  <div class="results-container">
    <h1>View Your Connections</h1>
    <div v-if="values" class="results-content">
      <div v-if="locationConnection" class="location-connections">
        <div
          v-for="(value, key) in locationConnection"
          :key="key"
          :class="{ 'best-match': key === 0, 'result-item': key !== 0 }"
        >
          <!-- :bestMatch="true ? key === 0 : false" -->
          <ConnectionCard
            :bestMatch="key === 0"
            :connectionData="{
              name: value.name,
              distance: value.distance,
              connection: value.connection,
            }"
          />
        </div>
      </div>
      <button @click="goHome" class="home-button">Back to Home</button>
    </div>
    <div v-else class="no-results">
      <p>No form data available</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { useFormStore } from "@/stores/formStore";
import {
  // makeLanguageConnection,
  makeLocationConnections,
  submitUserData,
} from "../../Joseph/Backend/backend_module.js";
import ConnectionCard from "@/Components/ConnectionCard.vue";

const router = useRouter();
const formStore = useFormStore();
const values = computed(() => formStore.getFormData());

const userId = ref(null);
const locationConnection = ref(null);

onMounted(async () => {
  try {
    const currentValues = formStore.getFormData();
    const { languages, ...locationValues } = currentValues;
    console.log("Form data retrieved from store:", currentValues);

    const toNum = (v) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    locationValues.highschool_lat = toNum(locationValues.highschool_lat);
    locationValues.highschool_lon = toNum(locationValues.highschool_lon);
    locationValues.mis1_lat = toNum(locationValues.mis1_lat);
    locationValues.mis1_lon = toNum(locationValues.mis1_lon);
    locationValues.mis2_lat = toNum(locationValues.mis2_lat);
    locationValues.mis2_lon = toNum(locationValues.mis2_lon);

    const id = await submitUserData(locationValues, userId.value); //Check to see if userId persists when we switch pages
    userId.value = id;
    console.log("Submitted user data, received userId:", id);

    if (id != null) {
      const locConn = await makeLocationConnections(id);
      locationConnection.value = locConn;
      console.log("Received location connection:", locConn);
    } else {
      console.warn("submitUserData returned null id");
    }
  } catch (err) {
    console.error("Error fetching user/location data:", err);
  }
});

function goHome() {
  try {
    formStore.resetForm();
  } catch (e) {
    // ignore if reset fails
  }
  try {
    localStorage.removeItem("formData");
  } catch (e) {
    // ignore localStorage errors
  }
  router.push("/");
}
</script>

<style scoped>
.best-match {
  border: none;
  position: absolute;
  top: 6em;
  left: calc(50% - 200px);

  @media (max-width: 450px) {
    position: static;
    border-bottom: 2px solid #e0e0e0;
  }
}
.location-connections {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  @media (max-width: 450px) {
    flex-direction: column;
    align-items: center;
  }
}
.results-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.results-content {
  margin-top: 20em;

  @media (max-width: 450px) {
    margin-top: 2.5em;
  }
}

.result-item {
  display: flex;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  height: 18em;

  @media (max-width: 450px) {
    margin: 0;
  }
}

.label {
  font-weight: bold;
  margin-right: 1rem;
  min-width: 150px;
}

.value {
  color: #333;
}

.no-results {
  text-align: center;
  color: #999;
  margin-top: 2rem;
}

.home-button {
  display: block;
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.home-button:hover {
  background-color: #318760;
}
</style>
