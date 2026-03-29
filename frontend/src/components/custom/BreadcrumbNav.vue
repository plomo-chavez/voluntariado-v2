<template>
  <nav class="">
    <h4>{{ steps[step].title }}</h4>
    <ul class="breadcrumb">
      <li
        v-for="(stepConfig, index) in steps"
        :key="index"
        :class="{ active: step === index, completed: step > index }"
      />
      <!-- @click="goToStep(index)" -->
    </ul>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  steps: Array<{ title: string }>;
  step: number;
}>();
</script>

<style lang="scss">
.breadcrumb {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  height: 3px;
  width: 100%;
  padding: 0px !important;
  list-style: none;
  border-radius: 5px;
}

.breadcrumb {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  height: 3px;
  width: 100%;
  padding: 0px !important;
  list-style: none;
  // background-color: #f8f9fa;
  border-radius: 5px;
}

.breadcrumb ul {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style: none; // Esto elimina las viñetas
}

.breadcrumb li {
  transform: none;
  border-radius: 5px;
  height: 5px;
  width: calc((100% / 8)) !important;
  margin-left: 10px;
  margin-right: 10px;
  background-color: #c0c0c0;
  color: rgb(var(--v-theme-primaryDark)) !important;
  font-size: 14px;
  font-weight: bold;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.breadcrumb li.active {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: #fff;
}
.breadcrumb li.active:hover {
  background-color: rgb(
    var(--v-theme-primary)
  ) !important; /* Cambia este color según lo que desees */
  color: #fff;
}

.breadcrumb li.completed {
  background-color: rgb(var(--v-theme-success)) !important;
  color: #fff;
}

.breadcrumb li:hover {
  background-color: rgb(var(--v-theme-grey-400)) !important;
  color: #fff;
}
</style>
