<script setup>
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFormStore } from "../stores/formStore.js";

const router = useRouter();
const formStore = useFormStore();
const hasSecondMission = ref(false);

/* ---------------- STORE FIELDS ---------------- */

const name = computed({
  get: () => formStore.formData.full_name,
  set: v => formStore.updateField("full_name", v)
});

const languages = computed({
  get: () => formStore.formData.languages,
  set: v => formStore.updateField("languages", v)
});

/* ---------------- CSV BASE PATH ---------------- */

const BASE = process.env.NODE_ENV === "production"
  ? "/friends-around-me-2026/"
  : "/";

/* ---------------- SCHOOL AUTOCOMPLETE ---------------- */

const schoolsMap = ref({});
const schoolQuery = ref("");
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

// City fallback for "Don't see your high school?"
const showCitySelect = ref(false);
const cityQuery = ref("");
const showCitySuggestions = ref(false);

const allSchools = computed(() =>
  Object.values(schoolsMap.value).flat().filter(Boolean).sort((a, b) => a.label.localeCompare(b.label))
);

const suggestions = computed(() => {
  const q = schoolQuery.value.toLowerCase().trim();
  if (!q) return allSchools.value.slice(0, 50);
  return allSchools.value.filter(s => s.label.toLowerCase().includes(q)).slice(0, 50);
});

const citySelectSuggestions = computed(() => cityFilter(cityQuery.value));

// Called only when user physically types in the school input
function onSchoolInput() {
  formStore.updateField("highschool_lat", "");
  formStore.updateField("highschool_lon", "");
}

// Called only when user physically types in the city fallback input
function onCityInput() {
  formStore.updateField("highschool_lat", "");
  formStore.updateField("highschool_lon", "");
}

/* ---------------- LANGUAGE AUTOCOMPLETE ---------------- */

const languagesMap = ref({});
const languageQuery = ref("");
const showLangSuggestions = ref(false);

const allLanguages = computed(() =>
  Object.values(languagesMap.value).flat().filter(Boolean).sort((a, b) => a.localeCompare(b))
);

const languageSuggestions = computed(() => {
  const q = languageQuery.value.toLowerCase().trim();
  if (!q) return allLanguages.value.slice(0, 50);
  return allLanguages.value.filter(l => l.toLowerCase().includes(q)).slice(0, 50);
});

/* ---------------- CITY AUTOCOMPLETE ---------------- */

const citiesMap = ref({});
const missionQuery = ref("");
const showMissionSuggestions = ref(false);
const mission2Query = ref("");
const showMission2Suggestions = ref(false);

// Called only when user physically types in the mission inputs
function onMissionInput() {
  formStore.updateField("mis1_lat", "");
  formStore.updateField("mis1_lon", "");
}

function onMission2Input() {
  formStore.updateField("mis2_lat", "");
  formStore.updateField("mis2_lon", "");
}

function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, " ").trim();
}

function cityFilter(q) {
  if (!q) return [];
  const nq = normalize(q);
  return Object.values(citiesMap.value).flat().filter(c => normalize(c.label).includes(nq)).slice(0, 50);
}

const missionCitySuggestions = computed(() => cityFilter(missionQuery.value));
const mission2CitySuggestions = computed(() => cityFilter(mission2Query.value));

/* ---------------- LOAD CSVs ---------------- */

onMounted(async () => {

  // Reset the store so stale localStorage data never bypasses validation
  formStore.resetForm();

  try {

    // Schools — columns: ,name,city,state,lat,lon
    const sRes = await fetch(`${BASE}schools.csv`);
    const sText = await sRes.text();
    const sLines = sText.split("\n").filter(Boolean);
    const sHead = sLines[0].trim().split(",");
    const sNameIdx  = sHead.indexOf("name");
    const sCityIdx  = sHead.indexOf("city");
    const sStateIdx = sHead.indexOf("state");
    const sLatIdx   = sHead.indexOf("lat");
    const sLonIdx   = sHead.indexOf("lon");

    schoolsMap.value = {
      ALL: sLines.slice(1).map(l => {
        const cols = l.split(",");
        const name  = cols[sNameIdx]?.replace(/"/g, "").trim();
        const city  = cols[sCityIdx]?.replace(/"/g, "").trim();
        const state = cols[sStateIdx]?.replace(/"/g, "").trim();
        const lat   = cols[sLatIdx]?.replace(/"/g, "").trim();
        const lon   = cols[sLonIdx]?.replace(/"/g, "").trim();
        if (!name) return null;
        const label = [name, city, state].filter(Boolean).join(", ");
        return { label, name, lat, lon };
      }).filter(Boolean)
    };

    // Languages — columns: lang
    const lRes = await fetch(`${BASE}world_languages.csv`);
    const lText = await lRes.text();
    const lLines = lText.split("\n").filter(Boolean);
    const lHead = lLines[0].trim().split(",");
    const lIndex = lHead.indexOf("lang");

    languagesMap.value = {
      ALL: lLines.slice(1).map(l => {
        const cols = l.split(",");
        return cols[lIndex]?.replace(/"/g, "").trim();
      }).filter(Boolean)
    };

    // Cities — columns: name,state,country,latitude,longitude
    const cRes = await fetch(`${BASE}cities.csv`);
    const cText = await cRes.text();
    const cLines = cText.split("\n").filter(Boolean);
    const cHead = cLines[0].trim().split(",");
    const nameIdx    = cHead.indexOf("name");
    const stateIdx   = cHead.indexOf("state");
    const countryIdx = cHead.indexOf("country");
    const latIdx     = cHead.indexOf("latitude");
    const lonIdx     = cHead.indexOf("longitude");

    citiesMap.value = {
      ALL: cLines.slice(1).map(l => {
        const cols = l.split(",");
        const name    = cols[nameIdx]?.replace(/"/g, "").trim();
        const state   = cols[stateIdx]?.replace(/"/g, "").trim();
        const country = cols[countryIdx]?.replace(/"/g, "").trim();
        const lat     = cols[latIdx]?.replace(/"/g, "").trim();
        const lon     = cols[lonIdx]?.replace(/"/g, "").trim();
        if (!name) return null;
        const label = [name, state, country].filter(Boolean).join(", ");
        return { label, name, lat, lon };
      }).filter(Boolean)
    };

  } catch (e) {
    console.error("CSV load failed", e);
  }
});

/* ---------------- SELECTORS ---------------- */

function selectSchool(school) {
  schoolQuery.value = school.label;
  formStore.updateField("highschool_name", school.name);
  formStore.updateField("highschool_lat", school.lat);
  formStore.updateField("highschool_lon", school.lon);
  showSuggestions.value = false;
  showCitySelect.value = false;
  highlightedIndex.value = -1;
}

function selectHighschoolCity(city) {
  cityQuery.value = city.label;
  formStore.updateField("highschool_name", city.name);
  formStore.updateField("highschool_lat", city.lat);
  formStore.updateField("highschool_lon", city.lon);
  showCitySuggestions.value = false;
}

function selectLanguage(lang) {
  if (!languages.value.includes(lang))
    languages.value = [...languages.value, lang];
  languageQuery.value = "";
  showLangSuggestions.value = false;
}

function removeLanguage(lang) {
  languages.value = languages.value.filter(l => l !== lang);
}

function selectMissionCity(city) {
  missionQuery.value = city.label;
  formStore.updateField("mis1_name", city.name);
  formStore.updateField("mis1_lat", city.lat);
  formStore.updateField("mis1_lon", city.lon);
  showMissionSuggestions.value = false;
}

function selectMission2City(city) {
  mission2Query.value = city.label;
  formStore.updateField("mis2_name", city.name);
  formStore.updateField("mis2_lat", city.lat);
  formStore.updateField("mis2_lon", city.lon);
  showMission2Suggestions.value = false;
}

/* ---------------- KEYBOARD NAV (schools) ---------------- */

function down()  { if (highlightedIndex.value < suggestions.value.length - 1) highlightedIndex.value++; }
function up()    { if (highlightedIndex.value > 0) highlightedIndex.value--; }
function enter() { if (highlightedIndex.value >= 0) selectSchool(suggestions.value[highlightedIndex.value]); }

/* ---------------- BLUR HELPERS ---------------- */

function hideSchool()     { setTimeout(() => showSuggestions.value = false, 150); }
function hideCitySelect() { setTimeout(() => showCitySuggestions.value = false, 150); }
function hideLang()       { setTimeout(() => showLangSuggestions.value = false, 150); }
function hideMission()    { setTimeout(() => showMissionSuggestions.value = false, 150); }
function hideMission2()   { setTimeout(() => showMission2Suggestions.value = false, 150); }

/* ---------------- VALIDATION ---------------- */

const SWEAR_WORDS = [
  "fuck", "shit", "ass", "bitch", "bastard", "damn", "crap", "piss",
  "cock", "dick", "pussy", "cunt", "whore", "slut", "fag", "nigger",
  "nigga", "retard", "twat", "wank", "bollocks", "arse", "shite",
];

function containsSwear(str) {
  return SWEAR_WORDS.some(word => {
    const re = new RegExp(`\\b${word}\\b`, "i");
    return re.test(str);
  });
}

const hasValidName = computed(() => {
  const n = formStore.formData.full_name.trim();
  return n.length > 0 && !containsSwear(n);
});

const hasLocationSelected = computed(() => {
  const d = formStore.formData;
  return !!(d.highschool_lat || d.mis1_lat);
});

const canSubmit = computed(() => hasValidName.value && hasLocationSelected.value);

const submitted = ref(false);

const nameError = computed(() => {
  if (!submitted.value) return "";
  const n = formStore.formData.full_name.trim();
  if (!n) return "Please enter your name.";
  if (containsSwear(n)) return "Please enter an appropriate name.";
  return "";
});

const locationError = computed(() => {
  if (!submitted.value) return "";
  if (!hasLocationSelected.value) return "Please select at least your high school or mission location from the dropdown.";
  return "";
});

/* ---------------- SUBMIT ---------------- */

function onSubmit() {
  submitted.value = true;
  if (!canSubmit.value) return;
  router.push("/results");
}
</script>

<template>
  <div class="friends-form-wrapper">
    <form @submit.prevent="onSubmit">
      <div class="form-inputs">

        <!-- ROW 1: Name + High School -->
        <div class="row-wrapper">

          <!-- Full Name -->
          <div class="dropdown-wrapper">
            <label>Full Name</label>
            <input
              v-model="name"
              type="text"
              placeholder="Enter your full name..."
              :class="{ 'input-error': nameError }"
            />
            <span v-if="nameError" class="error-text">{{ nameError }}</span>
          </div>

          <!-- High School -->
          <div class="dropdown-wrapper">
            <label>Where did you graduate high school?</label>
            <input
              v-model="schoolQuery"
              @input="onSchoolInput"
              @focus="showSuggestions = true; showCitySelect = false;"
              @blur="hideSchool"
              @keydown.down.prevent="down"
              @keydown.up.prevent="up"
              @keydown.enter.prevent="enter"
              placeholder="Start typing school..."
              :class="{ 'input-error': locationError && !formStore.formData.highschool_lat }"
            />

            <!-- School suggestions -->
            <ul v-if="showSuggestions" class="suggestions-list">
              <li v-if="suggestions.length === 0" class="no-matches">
                No matches found
              </li>
              <li
                v-for="(s, i) in suggestions"
                :key="s.label + i"
                :class="{ highlighted: i === highlightedIndex }"
                @mousedown.prevent="selectSchool(s)"
              >
                {{ s.label }}
              </li>
            </ul>

            <!-- Always visible when focused and city fallback isn't open -->
            <div
              v-if="showSuggestions && !showCitySelect"
              class="add-new"
              @mousedown.prevent="showCitySelect = true; showSuggestions = false; highlightedIndex = -1;"
            >
              Don't see your high school?
            </div>

            <!-- City fallback -->
            <div v-if="showCitySelect" class="city-fallback">
              <input
                v-model="cityQuery"
                @input="onCityInput"
                @focus="showCitySuggestions = true"
                @blur="hideCitySelect"
                placeholder="Enter your city..."
              />
              <ul v-if="showCitySuggestions" class="suggestions-list">
                <li v-if="citySelectSuggestions.length === 0" class="no-matches">
                  {{ cityQuery ? 'No matches found' : 'Start typing a city...' }}
                </li>
                <li
                  v-for="c in citySelectSuggestions"
                  :key="c.label"
                  @mousedown.prevent="selectHighschoolCity(c)"
                >
                  {{ c.label }}
                </li>
              </ul>
            </div>
          </div>

        </div>

        <!-- ROW 2: Languages + Mission(s) -->
        <div class="row-wrapper row-spacing">

          <!-- Languages -->
          <div class="dropdown-wrapper">
            <label>Languages Spoken</label>
            <input
              v-model="languageQuery"
              @focus="showLangSuggestions = true"
              @blur="hideLang"
              placeholder="Add language(s)..."
            />
            <ul v-if="showLangSuggestions" class="suggestions-list">
              <li v-if="languageSuggestions.length === 0" class="no-matches">
                {{ languageQuery ? 'No matches found' : 'Start typing a language...' }}
              </li>
              <li
                v-for="(l, i) in languageSuggestions"
                :key="l + i"
                @mousedown.prevent="selectLanguage(l)"
              >
                {{ l }}
              </li>
            </ul>
            <div class="tag-container">
              <span v-for="lang in languages" :key="lang" class="tag">
                {{ lang }}
                <button @click.prevent="removeLanguage(lang)">×</button>
              </span>
            </div>
          </div>

          <!-- Missions -->
          <div>
            <div class="dropdown-wrapper">
              <label>Where did you serve your mission?</label>
              <input
                v-model="missionQuery"
                @input="onMissionInput"
                @focus="showMissionSuggestions = true"
                @blur="hideMission"
                placeholder="Start typing city..."
                :class="{ 'input-error': locationError && !formStore.formData.mis1_lat }"
              />
              <ul v-if="showMissionSuggestions" class="suggestions-list">
                <li v-if="missionCitySuggestions.length === 0" class="no-matches">
                  {{ missionQuery ? 'No matches found' : 'Start typing a city...' }}
                </li>
                <li
                  v-for="c in missionCitySuggestions"
                  :key="c.label"
                  @mousedown.prevent="selectMissionCity(c)"
                >
                  {{ c.label }}
                </li>
              </ul>
            </div>

            <label class="checkbox-label" style="margin-top:1rem;">
              <input type="checkbox" v-model="hasSecondMission" />
              I served in more than one mission
            </label>

            <div v-if="hasSecondMission" class="dropdown-wrapper" style="margin-top:1rem;">
              <label>Second Mission Location</label>
              <input
                v-model="mission2Query"
                @input="onMission2Input"
                @focus="showMission2Suggestions = true"
                @blur="hideMission2"
                placeholder="Start typing city..."
              />
              <ul v-if="showMission2Suggestions" class="suggestions-list">
                <li v-if="mission2CitySuggestions.length === 0" class="no-matches">
                  {{ mission2Query ? 'No matches found' : 'Start typing a city...' }}
                </li>
                <li
                  v-for="c in mission2CitySuggestions"
                  :key="c.label"
                  @mousedown.prevent="selectMission2City(c)"
                >
                  {{ c.label }}
                </li>
              </ul>
            </div>

            <span v-if="locationError" class="error-text" style="margin-top:.5rem; display:block;">
              {{ locationError }}
            </span>
          </div>

        </div>
      </div>

      <button type="submit" :disabled="submitted && !canSubmit" :class="{ 'btn-disabled': submitted && !canSubmit }">
        Submit
      </button>
    </form>
  </div>
</template>

<style scoped>
.friends-form-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  border: 5px solid #88b940;
  border-radius: 1em;
  padding: 1.5em 1em;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 900px;
}

.row-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 600px) {
  .row-wrapper {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .row-spacing {
    margin-top: 0;
  }
}

.row-spacing {
  margin-top: 1rem;
}

.dropdown-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.dropdown-wrapper label {
  display: block;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.dropdown-wrapper input {
  padding: 8px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  width: 100%;
  max-width: 350px;
  box-sizing: border-box;
  font-size: 1rem;
}

@media (max-width: 600px) {
  .dropdown-wrapper input {
    max-width: 100%;
  }
}

.input-error {
  border-color: #e53e3e !important;
}

.error-text {
  color: #e53e3e;
  font-size: .85rem;
  margin-top: .25rem;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-height: 200px;
  overflow: auto;
  margin-top: 2px;
  z-index: 100;
  list-style: none;
  padding: 0;
  max-width: 100vw;
}

.suggestions-list li {
  padding: .4rem .6rem;
  cursor: pointer;
}

.suggestions-list li:hover {
  background: #eef7ea;
}

.highlighted {
  background: #eef7ea;
}

.no-matches {
  color: #999;
  font-style: italic;
  cursor: default !important;
}

.no-matches:hover {
  background: none !important;
}

.add-new {
  padding: .4rem .6rem;
  font-weight: 600;
  color: #4a7c2f;
  cursor: pointer;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 6px 6px;
  background: white;
}

.add-new:hover {
  background: #eef7ea;
}

.city-fallback {
  margin-top: .5rem;
  position: relative;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: .3rem;
  margin-top: .4rem;
}

.tag {
  background: #eef7ea;
  padding: .25rem .5rem;
  border-radius: 999px;
  font-size: .8rem;
  display: flex;
  align-items: center;
  gap: .3rem;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: .5rem;
  cursor: pointer;
}

button[type="submit"] {
  padding: .6rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background .2s, opacity .2s;
}

button[type="submit"]:hover:not(.btn-disabled) {
  background: #318760;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
}
</style>