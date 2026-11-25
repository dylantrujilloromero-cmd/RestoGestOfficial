<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo-badge"><i class="bi bi-cup-hot"></i></div>
      <div><h2>RestoGest</h2><span>{{ restaurantes.length }} restaurantes</span></div>
    </div>

    <div class="role-badge-panel">
      <div class="role-tag" :class="currentUser?.rol === 'JEFE' ? 'jefe' : 'admin'">
        <i class="bi" :class="currentUser?.rol === 'JEFE' ? 'bi-star-fill' : 'bi-person-fill'"></i>
        {{ currentUser?.rol === 'JEFE' ? 'Jefe' : 'Administrador' }}
      </div>
      <div class="user-name">{{ currentUser?.nombre_completo }}</div>
      <div class="user-rest-assigned">{{ isJefe ? 'Supervisa todos los restaurantes' : currentRestaurant.nombre }}</div>
      <button class="btn-logout" @click="$emit('logout')"><i class="bi bi-box-arrow-right"></i> Cerrar sesión</button>
    </div>

    <div v-if="isJefe" class="boss-restaurant-switch">
      <label>Restaurante que estás viendo</label>
      <select class="boss-select" :value="selectedRestaurantId" @change="$emit('update:selectedRestaurantId', $event.target.value)">
        <option v-for="r in restaurantes" :key="r.id" :value="r.id">{{ r.nombre }}</option>
      </select>
    </div>

    <ul class="nav-menu">
      <li class="nav-item" :class="{ active: activeTab === 'calendario' }" @click="$emit('update:activeTab', 'calendario')"><span class="nav-icon"><i class="bi bi-calendar3"></i></span><span>Calendario</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'reservas_lista' }" @click="$emit('update:activeTab', 'reservas_lista')"><span class="nav-icon"><i class="bi bi-list-ul"></i></span><span>Lista de reservas</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'novedades' }" @click="$emit('update:activeTab', 'novedades')"><span class="nav-icon"><i class="bi bi-megaphone"></i></span><span>Novedades</span></li>
      <li class="nav-item" :class="{ active: activeTab === 'briefing' }" @click="$emit('update:activeTab', 'briefing')"><span class="nav-icon"><i class="bi bi-journal-text"></i></span><span>Briefing</span></li>
      <li v-if="isJefe" class="nav-item" :class="{ active: activeTab === 'ajustes_jefe' }" @click="$emit('update:activeTab', 'ajustes_jefe')"><span class="nav-icon"><i class="bi bi-gear"></i></span><span>Ajustes y cuentas</span></li>
    </ul>

    <div class="sidebar-foot">Sistema de reservas multirestaurante</div>
  </aside>
</template>
<script setup>
defineProps(['currentUser','isJefe','restaurantes','selectedRestaurantId','currentRestaurant','activeTab'])
defineEmits(['update:activeTab','update:selectedRestaurantId','logout'])
</script>
