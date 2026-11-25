<template>
  <header class="topbar">
    <div style="display: flex; align-items: center; gap: 18px;">
      <div class="restaurant-logo-area">
        <img v-if="currentRestaurantLogo" :src="currentRestaurantLogo" alt="Logo" class="restaurant-logo-img">
        <div v-else class="restaurant-logo-placeholder">🍽️</div>
        <label v-if="isJefe" class="logo-upload-btn" title="Subir logo">📷<input type="file" accept="image/*" @change="$emit('logoUpload', $event)" style="display:none;"></label>
      </div>
      <div class="restaurant-title-box">
        <h1>{{ currentRestaurant.nombre }}</h1>
        <p>{{ currentRestaurant.direccion }} • Tel: {{ currentRestaurant.telefono }}</p>
      </div>
      <a v-if="currentRestaurantCarta" :href="currentRestaurantCarta" target="_blank" class="btn btn-secondary" style="padding:6px 14px; font-size:0.82rem; text-decoration:none; margin-left:12px;">📄 Ver Carta</a>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" @click="$emit('addReserva')"><span>➕</span><span>Añadir Reserva</span></button>
    </div>
  </header>
</template>
<script setup>
defineProps(['currentRestaurant','currentRestaurantLogo','currentRestaurantCarta','isJefe'])
defineEmits(['addReserva','logoUpload'])
</script>
