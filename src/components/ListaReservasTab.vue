<template>
  <div>
    <div class="day-schedule-section">
      <div class="schedule-header">
        <h3>Listado Completo de Reservas ({{ filteredReservas.length }})</h3>
        <button class="btn btn-primary" @click="$emit('openCreateModal')">➕ Nueva Reserva</button>
      </div>

      <div class="reservations-list">
        <div v-for="res in filteredReservas" :key="res.id" class="reservation-card">
          <div class="res-header">
            <div class="res-time-box">
              <span class="res-time">{{ res.fecha }} • {{ formatTimeTo12h(res.hora) }}</span>
              <span class="res-client-name">{{ res.nombre_cliente }}</span>
              <span style="color: var(--text-muted);">({{ res.numero_personas }} Comensales)</span>
            </div>
            <span class="status-badge" :class="res.estado">{{ res.estado }}</span>
          </div>
          <div class="res-details-grid">
            <div class="res-detail-item"><span class="detail-label">Contacto:</span><span class="detail-value">{{ res.telefono_contacto }}</span></div>
            <div class="res-detail-item"><span class="detail-label">Ocasión:</span><span class="detail-value">{{ getOccasionLabel(res.ocasion) }}</span></div>
            <div class="res-detail-item">
              <span class="detail-label">Postre:</span>
              <span class="dessert-pill" :class="res.postre_incluido ? 'yes' : 'no'">{{ res.postre_incluido ? 'Sí, incluido' : 'No' }}</span>
            </div>
          </div>
          <div class="res-actions-bar">
            <button class="btn btn-secondary" @click="$emit('openEditModal', res)">Editar</button>
            <button v-if="res.estado !== 'CANCELADA'" class="btn btn-danger" @click="$emit('cancelReservation', res)">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTimeTo12h, getOccasionLabel } from '../services/helpers.js'

defineProps({
  filteredReservas: Array
})

defineEmits(['openCreateModal', 'openEditModal', 'cancelReservation'])
</script>
