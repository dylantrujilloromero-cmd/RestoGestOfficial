<template>
  <header class="topbar">
    <div class="d-flex align-items-center gap-3 flex-wrap">
      <div class="restaurant-logo-area">
        <img v-if="currentRestaurantLogo" :src="currentRestaurantLogo" alt="Logo" class="restaurant-logo-img">
        <div v-else class="restaurant-logo-placeholder"><i class="bi bi-shop"></i></div>
        <label v-if="isJefe" class="logo-upload-btn" title="Subir logo"><i class="bi bi-camera-fill"></i><input type="file" accept="image/*" @change="$emit('logoUpload', $event)" style="display:none;"></label>
      </div>
      <div class="restaurant-title-box">
        <h1>{{ currentRestaurant.nombre }}</h1>
        <p>{{ currentRestaurant.direccion }} · Tel. {{ currentRestaurant.telefono }}</p>
      </div>
      <a v-if="currentRestaurantCarta" :href="currentRestaurantCarta" target="_blank" class="btn btn-secondary btn-sm"><i class="bi bi-file-earmark-text"></i> Ver carta</a>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" @click="$emit('addReserva')"><i class="bi bi-plus-lg"></i> Añadir reserva</button>
    </div>
  </header>
</template>
<script setup>
defineProps(['currentRestaurant','currentRestaurantLogo','currentRestaurantCarta','isJefe'])
defineEmits(['addReserva','logoUpload'])
</script>
