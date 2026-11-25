<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-badge">🍽️</div>
      <div><h2>RestoGest</h2><span>3 Restaurantes</span></div>
    </div>
    <div class="role-badge-panel">
      <div class="role-tag" :class="currentUser?.rol === 'JEFE' ? 'jefe' : 'admin'">
        {{ currentUser?.rol === 'JEFE' ? '👑 Rol: Jefe' : '👤 Rol: Administrador' }}
      </div>
      <div class="user-name">{{ currentUser?.nombre_completo }}</div>
      <div class="user-rest-assigned">{{ isJefe ? 'Supervisión de los 3 Restaurantes' : currentRestaurant.nombre }}</div>
      <button class="btn-logout" @click="$emit('logout')">Cerrar Sesión</button>
    </div>
    <div v-if="isJefe" class="boss-restaurant-switch">
      <label>Vista de Restaurante (Jefe):</label>
      <select class="boss-select" :value="selectedRestaurantId" @change="$emit('update:selectedRestaurantId', $event.target.value)">
        <option v-for="r in restaurantes" :key="r.id" :value="r.id">{{ r.nombre }}</option>
      </select>
    </div>
    <ul class="nav-menu">
      <li class="nav-item" :class="{ active: activeTab === 'calendario' }" @click="$emit('update:activeTab', 'calendario')"><span class="nav-icon"></span><span>Calendario de Reservas</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'reservas_lista' }" @click="$emit('update:activeTab', 'reservas_lista')"><span class="nav-icon"></span><span>Lista de Reservas</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'novedades' }" @click="$emit('update:activeTab', 'novedades')"><span class="nav-icon"></span><span>Novedades</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'briefing' }" @click="$emit('update:activeTab', 'briefing')"><span class="nav-icon"></span><span>Briefing</span></li>
      <li v-if="isJefe" class="nav-item" :class="{ active: activeTab === 'ajustes_jefe' }" @click="$emit('update:activeTab', 'ajustes_jefe')"><span class="nav-icon"></span><span>Ajustes y Cuentas</span></li>
    </ul>
    <div style="padding: 16px 20px; font-size: 0.75rem; color: #718096; border-top: 1px solid rgba(255,255,255,0.06);">Base de Datos: <strong>PostgreSQL</strong><br>Sin módulo de facturación</div>
  </aside>
</template>
<script setup>
defineProps(['currentUser','isJefe','restaurantes','selectedRestaurantId','currentRestaurant','activeTab'])
defineEmits(['update:activeTab','update:selectedRestaurantId','logout'])
</script>
