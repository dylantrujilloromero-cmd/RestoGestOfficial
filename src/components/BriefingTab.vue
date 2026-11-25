<template>
  <div>
    <div class="day-schedule-section">
      <div class="schedule-header">
        <h3>Briefing — {{ currentRestaurant.nombre }}</h3>
        <button class="btn btn-primary" @click="$emit('openBriefingForm')">➕ Agregar Briefing</button>
      </div>
      <!-- Lista -->
      <div v-if="filteredBriefings.length === 0" class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h4>No hay briefings registrados</h4>
        <p>Usa el botón "Agregar Briefing" para crear el primero.</p>
      </div>
      <div v-else class="reservations-list">
        <div v-for="br in filteredBriefings" :key="br.id" class="reservation-card">
          <div class="res-header">
            <div class="res-time-box">
              <span class="res-time">{{ br.fecha }}</span>
              <span class="res-client-name">Briefing del día</span>
            </div>
            <button class="btn btn-secondary" @click="$emit('verBriefing', br)">Ver</button>
          </div>
          <div class="res-details-grid">
            <div class="res-detail-item">
              <span class="detail-label">86 (No hay):</span>
              <span class="detail-value">{{ br.no_hay ? br.no_hay.substring(0, 60) + '...' : 'Sin datos' }}</span>
            </div>
            <div class="res-detail-item">
              <span class="detail-label">85 (Por acabarse):</span>
              <span class="detail-value">{{ br.por_acabarse ? br.por_acabarse.substring(0, 60) + '...' : 'Sin datos' }}</span>
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
  filteredBriefings: Array
})

defineEmits(['openBriefingForm', 'verBriefing'])
</script>
