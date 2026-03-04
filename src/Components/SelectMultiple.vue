<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";

const props = defineProps({
  title: { type: String, required: false, default: "" },
  modelValue: { type: Array, required: false, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

let idCounter = Date.now();

const newInput = ref("");
const inputs = ref(
  (props.modelValue || []).map((v) => ({ id: idCounter++, text: v })),
);

// Sync when parent updates modelValue (external changes only)
watch(
  () => props.modelValue,
  (newVal) => {
    // Check if the new value matches what we've already emitted
    const currentEmitted = inputs.value.map((i) => i.text);
    const isExternalChange =
      JSON.stringify(newVal) !== JSON.stringify(currentEmitted);
    if (isExternalChange) {
      inputs.value = (newVal || []).map((v) => ({ id: idCounter++, text: v }));
    }
  },
);

function addInput() {
  inputs.value.push({ id: idCounter++, text: newInput.value });
  newInput.value = "";
  emit(
    "update:modelValue",
    inputs.value.map((i) => i.text),
  );
}

function removeInput(input) {
  inputs.value = inputs.value.filter((i) => i.id !== input.id);
  emit(
    "update:modelValue",
    inputs.value.map((i) => i.text),
  );
}
</script>

<template>
  <div>
    <p>{{ props.title }}</p>
    <div>
      <input type="text" placeholder="Type something..." v-model="newInput" />
      <button class="add-button" type="button" @click="addInput">Add</button>
    </div>
    <div class="input-list">
      <div v-for="input in inputs" :key="input.id" class="input-item">
        {{ input.text }}
        <button class="remove-button" type="button" @click="removeInput(input)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
p {
  margin-block-end: 5px;
  font-size: 1.1em;
}

input {
  padding: 8px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  width: 350px;
  box-sizing: border-box;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--gray-400);
}

.add-button {
  padding: 8px 12px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  height: 36px;

  @media (max-width: 450px) {
    max-width: 90%;
    margin-left: 0;
    margin-top: 8px;
  }
}

.remove-button {
  padding: 4px 8px;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 12px;
}
</style>
