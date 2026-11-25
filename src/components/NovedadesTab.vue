<template>
  <div>
    <div class="day-schedule-section">
      <div class="schedule-header">
        <h3>Novedades — {{ currentRestaurant.nombre }}</h3>
        <div style="display:flex; gap:12px; align-items:center;">
          <input type="text" class="form-control" placeholder="Buscar por asunto..." :value="busquedaNovedad" @input="$emit('update:busquedaNovedad', $event.target.value)" style="max-width:250px;">
          <button class="btn btn-primary" @click="$emit('openNovedadForm')"><i class="bi bi-plus-lg"></i> Agregar novedad</button>
        </div>
      </div>
      <!-- Filtros -->
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <button class="btn" :class="filtroNovedad === 'todas' ? 'btn-primary' : 'btn-secondary'" @click="$emit('update:filtroNovedad', 'todas')">Todas</button>
        <button class="btn" :class="filtroNovedad === 'Novedad del Personal' ? 'btn-primary' : 'btn-secondary'" @click="$emit('update:filtroNovedad', 'Novedad del Personal')">Novedad del Personal</button>
        <button class="btn" :class="filtroNovedad === 'Novedad del Establecimiento' ? 'btn-primary' : 'btn-secondary'" @click="$emit('update:filtroNovedad', 'Novedad del Establecimiento')">Novedad del Establecimiento</button>
      </div>
      <!-- Lista -->
      <div v-if="filteredNovedades.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h4>No hay novedades registradas</h4>
        <p>Usa el botón "Agregar Novedad" para crear la primera.</p>
      </div>
      <div v-else class="reservations-list">
        <div v-for="nov in filteredNovedades" :key="nov.id" class="reservation-card">
          <div class="res-header">
            <div class="res-time-box">
              <span class="res-client-name">{{ nov.asunto }}</span>
              <span style="color: var(--text-muted); font-size:0.85rem;">{{ nov.fecha }}</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <span class="status-badge" :class="nov.prioridad === 'Alta' ? 'CANCELADA' : nov.prioridad === 'Media' ? 'PENDIENTE' : 'CONFIRMADA'">{{ nov.prioridad }}</span>
              <span class="status-badge" style="background:#e0e7ff; color:#3730a3;">{{ nov.tipo }}</span>
              <button class="btn btn-secondary" @click="$emit('verNovedad', nov)">Ver</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentRestaurant: Object,
  filteredNovedades: Array,
  busquedaNovedad: String,
  filtroNovedad: String
})

defineEmits(['update:busquedaNovedad', 'update:filtroNovedad', 'openNovedadForm', 'verNovedad'])
</script>
