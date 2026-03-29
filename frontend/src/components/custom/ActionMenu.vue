<script setup lang="ts">
import {
  VDivider,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
} from "vuetify/components";

const props: any = defineProps({
  avatarIcon: {
    type: String,
    default: "fa fa-ellipsis-v", // Ícono del botón activador
  },
  menuOptions: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<template>
  <div class="action-button-container">
    <!-- Icono como activador del menú -->
    <VMenu width="230" location="bottom end" offset="5px">
      <template #activator="{ props }">
        <VIcon
          v-bind="props"
          :icon="avatarIcon"
          class="action-icon"
          size="25"
          aria-label="Abrir menú de acciones"
        />
      </template>
      <VList>
        <template v-for="(option, index) in menuOptions" :key="index">
          <!-- Divider -->
          <VDivider v-if="option.divider" class="my-2" />
          <!-- Menu Item -->
          <VListItem
            v-else
            :key="option.label"
            :disabled="option.disabled"
            @click="option.action"
          >
            <template #prepend>
              <VIcon
                v-if="option.icon"
                class="me-2"
                :icon="option.icon"
                size="22"
              />
            </template>
            <VListItemTitle>{{ option.label }}</VListItemTitle>
          </VListItem>
        </template>
      </VList>
    </VMenu>
  </div>
</template>

<style scoped>
.action-button-container {
  position: relative;
  display: inline-block;
}

.action-icon {
  cursor: pointer;
  color: #1976d2;
  transition:
    color 0.3s ease,
    transform 0.2s ease;
}

.action-icon:hover {
  color: #0d47a1;
  transform: scale(1.1);
}
</style>
