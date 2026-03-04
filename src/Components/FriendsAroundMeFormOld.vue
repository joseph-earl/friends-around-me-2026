<!-- <script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useFormStore } from "../stores/formStore.js";
import TextBox from "./TextBox.vue";
import SelectMultiple from "./SelectMultiple.vue";

const router = useRouter();
const formStore = useFormStore();

const full_name = computed({
  get: () => formStore.formData.full_name,
  set: (value) => formStore.updateField("full_name", value),
});

const languages = computed({
  get: () => formStore.formData.languages,
  set: (value) => formStore.updateField("languages", value),
});

const highschool_name = computed({
  get: () => formStore.formData.highschool_name,
  set: (value) => formStore.updateField("highschool_name", value),
});

const highschool_lat = computed({
  get: () => formStore.formData.highschool_lat,
  set: (value) => formStore.updateField("highschool_lat", value),
});

const highschool_lon = computed({
  get: () => formStore.formData.highschool_lon,
  set: (value) => formStore.updateField("highschool_lon", value),
});

const mis1_name = computed({
  get: () => formStore.formData.mis1_name,
  set: (value) => formStore.updateField("mis1_name", value),
});

const mis1_lat = computed({
  get: () => formStore.formData.mis1_lat,
  set: (value) => formStore.updateField("mis1_lat", value),
});

const mis1_lon = computed({
  get: () => formStore.formData.mis1_lon,
  set: (value) => formStore.updateField("mis1_lon", value),
});

const mis2_name = computed({
  get: () => formStore.formData.mis2_name,
  set: (value) => formStore.updateField("mis2_name", value),
});

const mis2_lat = computed({
  get: () => formStore.formData.mis2_lat,
  set: (value) => formStore.updateField("mis2_lat", value),
});

const mis2_lon = computed({
  get: () => formStore.formData.mis2_lon,
  set: (value) => formStore.updateField("mis2_lon", value),
});

function onSubmit() {
  const payload = formStore.getFormData();
  console.log("Form submit:", payload);
  // Future: call API to query database
  router.push("/results");
}
</script>

<template>
  <div class="friends-form-wrapper">
    <form @submit.prevent="onSubmit" @keydown.enter.prevent>
      <div class="form-inputs">
        <div class="row-wrapper">
          <TextBox v-model="full_name" title="Full Name" />
          <TextBox
            v-model="highschool_name"
            title="Where did you Graduate High School?"
          />
        </div>
        <div class="row-wrapper">
          <SelectMultiple v-model="languages" title="Languages Spoken" />
          <TextBox
            v-model="mis1_name"
            title="Where did you serve your mission?"
          />
        </div>
        <div class="second-mission">
          <p>
            Have you served in another mission? Enter that second location here!
          </p>
          <TextBox v-model="mis2_name" title="Second Mission Location" />
        </div>
        <div class="row-wrapper">
          <TextBox v-model="mis1_lat" title="Mission 1 Latitude" />
          <TextBox v-model="mis1_lon" title="Mission 1 Longitude" />
        </div>
        <div class="row-wrapper">
          <TextBox v-model="mis2_lat" title="Mission 2 Latitude" />
          <TextBox v-model="mis2_lon" title="Mission 2 Longitude" />
        </div>
        <div class="row-wrapper">
          <TextBox v-model="highschool_lat" title="High School Latitude" />
          <TextBox v-model="highschool_lon" title="High School Longitude" />
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<style scoped>
.friends-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  border: 5px solid #88b940;
  border-radius: 1em;
  padding: 1.5em 1em;
}

.form-inputs {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

form {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
}

button {
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #318760;
}

.row-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  align-items: center;
}

.second-mission {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.second-mission p {
  margin-block-end: -5px;
}
</style> -->



<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useFormStore } from "../stores/formStore.js";

const router = useRouter();
const formStore = useFormStore();
const hasSecondMission = ref(false);

/* ---------------- STORE FIELDS ---------------- */

const name = computed({
  get: () => formStore.formData.name,
  set: v => formStore.updateField("name", v)
});

const school = computed({
  get: () => formStore.formData.school,
  set: v => formStore.updateField("school", v)
});

const languages = computed({
  get: () => formStore.formData.languages,
  set: v => formStore.updateField("languages", v)
});

/* ---------------- SCHOOL AUTOCOMPLETE ---------------- */

const schoolsMap = ref({});
const schoolQuery = ref("");
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

const showCitySelect = ref(false);
const cityQuery = ref("");

const allSchools = computed(() =>
  Object.values(schoolsMap.value)
    .flat()
    .filter(Boolean)
    .sort((a,b)=>a.localeCompare(b))
);

const suggestions = computed(()=>{
  if(showCitySelect.value) return [];
  const q = schoolQuery.value.toLowerCase().trim();
  if(!q) return allSchools.value.slice(0,50);
  return allSchools.value.filter(s=>s.toLowerCase().includes(q)).slice(0,50);
});

watch(schoolQuery,v=>{
  school.value = v.trim();
});

/* ---------------- LANGUAGE AUTOCOMPLETE ---------------- */

const languagesMap = ref({});
const languageQuery = ref("");
const showLangSuggestions = ref(false);

const allLanguages = computed(() =>
  Object.values(languagesMap.value)
    .flat()
    .filter(Boolean)
    .sort((a,b)=>a.localeCompare(b))
);

const languageSuggestions = computed(()=>{
  const q = languageQuery.value.toLowerCase().trim();
  if(!q) return allLanguages.value.slice(0,50);
  return allLanguages.value.filter(l=>l.toLowerCase().includes(q)).slice(0,50);
});

/* ---------------- CITIES ---------------- */

const citiesMap = ref({});

/* mission 1 */
const missionQuery = ref("");
const showMissionSuggestions = ref(false);

/* mission 2 */
const mission2Query = ref("");
const showMission2Suggestions = ref(false);

function normalize(str){
  return str
    .toLowerCase()
    .replace(/,/g, "")       // remove commas
    .replace(/\s+/g, " ")    // normalize extra spaces
    .trim();
}

function cityFilter(q){
  if(!q) return [];

  const normalizedQuery = normalize(q);

  return Object.values(citiesMap.value)
    .flat()
    .filter(c => normalize(c).includes(normalizedQuery))
    .slice(0,50);
}


const missionCitySuggestions = computed(()=> cityFilter(missionQuery.value));
const mission2CitySuggestions = computed(()=> cityFilter(mission2Query.value));

/* ---------------- LOAD CSV ---------------- */

const BASE = process.env.NODE_ENV === "production"
  ? "/friends-around-me-2026/"
  : "/";

onMounted(async()=>{
  try{

    // schools
    const s = await fetch(`${BASE}updated_school_data.csv`);
    const st = await s.text();
    const slines = st.split("\n").filter(Boolean);
    const sHead = slines[0].split(",");
    const sIndex = sHead.indexOf("SCH_NAME");

    schoolsMap.value = {
      ALL: slines.slice(1).map(l=>{
        const cols=l.split(",");
        return cols[sIndex]?.replace(/"/g,"").trim();
      }).filter(Boolean)
    };

    // languages
    const l = await fetch(`${BASE}world_languages.csv`);
    const lt = await l.text();
    const llines = lt.split("\n").filter(Boolean);
    const lHead = llines[0].split(",");
    const lIndex = lHead.indexOf("lang");

    languagesMap.value = {
      ALL: llines.slice(1).map(l=>{
        const cols=l.split(",");
        return cols[lIndex]?.replace(/"/g,"").trim();
      }).filter(Boolean)
    };

    // cities
    const c = await fetch(`${BASE}cities.csv`);
    const ct = await c.text();
    const clines = ct.split("\n").filter(Boolean);
    const cHead = clines[0].split(",");
    const nameIndex = cHead.indexOf("name");

    citiesMap.value = {
      ALL: clines.slice(1).map(l=>{
        const cols = l.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        return cols[nameIndex]?.replace(/"/g,"").trim();
      }).filter(Boolean)
    };

  }catch(e){
    console.error("CSV load failed",e);
  }
});

/* ---------------- SELECTORS ---------------- */

function selectSchool(name){
  schoolQuery.value=name;
  showSuggestions.value=false;
}

function selectLanguage(name){
  if(!languages.value.includes(name))
    languages.value=[...languages.value,name];

  languageQuery.value="";
  showLangSuggestions.value=false;
}

function removeLanguage(lang){
  languages.value = languages.value.filter(l=>l!==lang);
}

function selectMissionCity(city){
  missionQuery.value=city;
  formStore.updateField("mission",city);
  showMissionSuggestions.value=false;
}

function selectMission2City(city){
  mission2Query.value=city;
  formStore.updateField("mission2",city);
  showMission2Suggestions.value=false;
}

/* ---------------- NAV KEYS ---------------- */

function down(){
  if(highlightedIndex.value < suggestions.value.length-1)
    highlightedIndex.value++;
}

function up(){
  if(highlightedIndex.value>0)
    highlightedIndex.value--;
}

function enter(){
  if(highlightedIndex.value>=0)
    selectSchool(suggestions.value[highlightedIndex.value]);
}

/* ---------------- BLUR HELPERS ---------------- */

function hideSchool(){ setTimeout(()=>showSuggestions.value=false,150); }
function hideLang(){ setTimeout(()=>showLangSuggestions.value=false,150); }
function hideMission(){ setTimeout(()=>showMissionSuggestions.value=false,150); }
function hideMission2(){ setTimeout(()=>showMission2Suggestions.value=false,150); }

/* ---------------- SUBMIT ---------------- */

function onSubmit(){
  router.push("/results");
}
</script>

<template>
<div class="friends-form-wrapper">
<form @submit.prevent="onSubmit">

<div class="form-inputs">

<!-- ROW 1 -->
<div class="row-wrapper">

<div class="dropdown-wrapper">
  <label>Full Name</label>
  <input
    v-model="name"
    type="text"
    placeholder="Enter your full name..."
  />
</div>


<div class="dropdown-wrapper">
<label>Where did you graduate high school?</label>

<input
v-model="schoolQuery"
@focus="showSuggestions=true"
@blur="hideSchool"
@keydown.down.prevent="down"
@keydown.up.prevent="up"
@keydown.enter.prevent="enter"
placeholder="Start typing school..."
/>

<ul v-if="showSuggestions" class="suggestions-list">

  <li
    v-for="(s,i) in suggestions"
    :key="s+i"
    :class="{highlighted:i===highlightedIndex}"
    @mousedown.prevent="selectSchool(s)"
  >
    {{s}}
  </li>

  <!-- Always visible inside dropdown -->
  <li
    class="add-new"
    @mousedown.prevent="
      showCitySelect=true;
      showSuggestions=false;
      highlightedIndex=-1;
    "
  >
    Don't see your high school?
  </li>

</ul>

<div v-if="showCitySelect" style="margin-top:.5rem;">
<input v-model="cityQuery" placeholder="Enter your city..."/>
</div>

</div>
</div>

<!-- ROW 2 -->
<div class="row-wrapper row-spacing">


  <!-- Languages -->
  <div class="dropdown-wrapper">
    <label>Languages Spoken</label>

    <input
      v-model="languageQuery"
      @focus="showLangSuggestions=true"
      @blur="hideLang"
      placeholder="Add language(s)..."
    />

    <ul v-if="showLangSuggestions && languageSuggestions.length" class="suggestions-list">
      <li
        v-for="(l,i) in languageSuggestions"
        :key="l+i"
        @mousedown.prevent="selectLanguage(l)"
      >
        {{l}}
      </li>
    </ul>

    <div class="tag-container">
      <span v-for="lang in languages" :key="lang" class="tag">
        {{lang}}
        <button @click.prevent="removeLanguage(lang)">×</button>
      </span>
    </div>
  </div>

  <!-- Mission Column -->
  <div>
    <div class="dropdown-wrapper">
      <label>Where did you serve your mission?</label>

      <input
        v-model="missionQuery"
        @focus="showMissionSuggestions=true"
        @blur="hideMission"
        placeholder="Start typing city..."
      />

      <ul v-if="showMissionSuggestions && missionCitySuggestions.length" class="suggestions-list">
        <li
          v-for="c in missionCitySuggestions"
          :key="c"
          @mousedown.prevent="selectMissionCity(c)"
        >
          {{c}}
        </li>
      </ul>
    </div>

    <!-- Checkbox UNDER Mission 1 -->
    <label class="checkbox-label" style="margin-top:1rem;">
      <input type="checkbox" v-model="hasSecondMission" />
      I served in more than one mission
    </label>

    <!-- Second Mission (conditionally shown) -->
    <div v-if="hasSecondMission" class="dropdown-wrapper" style="margin-top:1rem;">
      <label>Second Mission Location</label>

      <input
        v-model="mission2Query"
        @focus="showMission2Suggestions=true"
        @blur="hideMission2"
        placeholder="Start typing city..."
      />

      <ul v-if="showMission2Suggestions && mission2CitySuggestions.length" class="suggestions-list">
        <li
          v-for="c in mission2CitySuggestions"
          :key="c"
          @mousedown.prevent="selectMission2City(c)"
        >
          {{c}}
        </li>
      </ul>
    </div>
  </div>

</div>




</div>

<button type="submit">Submit</button>
</form>
</div>
</template>

<style scoped>
.friends-form-wrapper{
  display:flex;
  justify-content:center;
  margin-bottom:2rem;
  border:5px solid #88b940;
  border-radius:1em;
  padding:1.5em 1em;
}

form{
  display:flex;
  flex-direction:column;
  gap:1rem;
  width:100%;
  max-width:900px;
}

/* FIXED: align items from the top */
.row-wrapper{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:2rem;
  align-items:start;
}

.dropdown-wrapper{
  position:relative;
  display:flex;
  flex-direction:column;
}

/* FIXED: make labels block + match TextBox sizing */
.dropdown-wrapper label{
  display:block;
  margin-bottom:5px;
  font-size:1.1em;
}

/* Match TextBox input styling exactly */
.dropdown-wrapper input{
  padding:8px;
  border:1px solid var(--color-primary);
  border-radius:4px;
  width:350px;
  box-sizing:border-box;
  font-size:1rem;
}

.suggestions-list{
  position:absolute;
  top:100%;
  left:0;
  right:0;
  background:white;
  border:1px solid #ccc;
  border-radius:6px;
  max-height:200px;
  overflow:auto;
  margin-top:2px;
  z-index:100;
  list-style:none;
  padding:0;
}

.suggestions-list li{
  padding:.4rem .6rem;
  cursor:pointer;
}

.highlighted{
  background:#eef7ea;
}

.add-new{
  font-weight:600;
  color:#4a7c2f;
  border-top:1px solid #ddd;
}

.tag-container{
  display:flex;
  flex-wrap:wrap;
  gap:.3rem;
  margin-top:.4rem;
}

.tag{
  background:#eef7ea;
  padding:.25rem .5rem;
  border-radius:999px;
  font-size:.8rem;
  display:flex;
  align-items:center;
  gap:.3rem;
}

.tag button{
  background:none;
  border:none;
  cursor:pointer;
  font-weight:bold;
}

button[type="submit"]{
  padding:.6rem;
  background:var(--color-primary);
  color:white;
  border:none;
  border-radius:6px;
  cursor:pointer;
}
.row-spacing{
  margin-top:1rem;
}

</style>