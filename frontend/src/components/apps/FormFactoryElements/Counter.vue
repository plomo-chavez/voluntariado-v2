<template>
  <div class="counter">
    <VBtn
      color="primary"
      size="small"
      variant="outlined"
      @click="updateCount('decrease')"
      :disabled="props.disabled"
    >
      <p class="lblButtonCounter">-</p>
    </VBtn>
    <input
      type="text"
      v-model="count"
      :disabled="props.disabled"
      class="counter-input"
      @input="validateInput"
    />
    <VBtn
      color="primary"
      size="small"
      variant="outlined"
      @click="updateCount('increase')"
      :disabled="props.disabled"
    >
      <p class="lblButtonCounter">+</p>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    valor?: number;
    disabled?: boolean;
    max?: any;
    min?: any;
  }>(),
  {
    valor: 1,
    disabled: false,
    min: null,
    max: null,
  },
);

const emit = defineEmits<{
  (event: "update", value: any): void;
}>();

const count = ref(props.valor);

const updateCount = (operation: "increase" | "decrease") => {
  if (operation === "increase") {
    if (
      props.max !== null &&
      typeof props.max === "number" &&
      count.value >= props.max
    ) {
      return;
    }
    count.value++;
  } else if (operation === "decrease") {
    if (
      props.min !== null &&
      typeof props.min === "number" &&
      count.value <= props.min
    ) {
      return;
    }
    count.value--;
  }
  handleUpdate();
};

const handleUpdate = () => {
  emit("update", count.value);
};

const validateInput = () => {
  if (isNaN(count.value) || count.value < 0) {
    count.value = 0;
  }
};

onBeforeMount(() => {
  let initialValue = props.valor;
  if (typeof props.min == "number" && initialValue < props.min) {
    initialValue = props.min;
  }
  if (typeof props.max == "number" && initialValue > props.max) {
    initialValue = props.max;
  }
  count.value = initialValue;
});
</script>

<style scoped>
.counter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.counter-input {
  width: 50px;
  text-align: center;
  font-size: 16px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.lblButtonCounter {
  font-size: 20px;
  font-weight: bolder;
  margin: 0;
  padding: 0;
}
</style>
