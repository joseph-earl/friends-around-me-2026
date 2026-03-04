<!-- <script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  title: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  modelValue: { type: String, required: false, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <div>
    <p class="text-box-title">{{ props.title }}</p>
    <p class="text-box-description">{{ props.description }}</p>
    <input type="text" placeholder="Type something..." v-model="inputValue" />
  </div>
</template>

<style scoped>
.text-box-title {
  margin-block-end: 5px;
  font-size: 1.1em;
}

input {
  padding: 8px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  min-width: 350px;
  box-sizing: border-box;

  @media (max-width: 850px) {
    min-width: 500px;
  }
  @media (max-width: 650px) {
    min-width: 400px;
  }
  @media (max-width: 500px) {
    min-width: 350px;
  }
  @media (max-width: 400px) {
    min-width: 325px;
  }
}
</style> -->



<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  title: { type: String, required: false, default: "" },
  description: { type: String, required: false, default: "" },
  modelValue: { type: String, required: false, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const inputValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <div>
    <p class="text-box-title">{{ props.title }}</p>
    <p class="text-box-description">{{ props.description }}</p>
    <input type="text" placeholder="Type something..." v-model="inputValue" />
  </div>
</template>

<style scoped>
.text-box-title {
  margin-block-end: 5px;
  font-size: 1.1em;
}

input {
  padding: 4px 6px; /* MATCHES default browser inputs */
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  width: 350px;
  box-sizing: border-box;
  font-size: 1rem;
}
</style>