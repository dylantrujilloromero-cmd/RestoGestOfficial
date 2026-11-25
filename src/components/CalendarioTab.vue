<template>
  <div>
    <div class="calendar-card">
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="btn btn-secondary" @click="$emit('goToToday')">Hoy</button>
          <button class="btn-icon" @click="$emit('prevMonth')" aria-label="Mes anterior"><i class="bi bi-chevron-left"></i></button>
          <h2>{{ monthYearTitle }}</h2>
          <button class="btn-icon" @click="$emit('nextMonth')" aria-label="Mes siguiente"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Haz clic en cualquier día para ver sus reservas programadas
        </div>
      </div>

      <div class="calendar-grid-header">
        <div>Lun</div><div>Mar</div><div>Mié</div>
        <div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
      </div>

      <div class="calendar-grid-days">
        <div
          v-for="(cell, idx) in calendarGridCells"
          :key="idx"
          class="calendar-day-cell"
          :class="{ 'other-month': cell.isOtherMonth, 'today': cell.isToday, 'selected': cell.isSelected }"
          @click="$emit('selectDate', cell)"
        >
          <div class="day-cell-top">
            <span class="day-number">{{ cell.dayNumber }}</span>
            <span v-if="cell.reservations.length > 0" style="font-size: 0.72rem; font-weight: 700; color: var(--primary-dark);">
              {{ cell.reservations.length }} res.
            </span>
          </div>
          <div class="day-badges">
            <div
              v-for="res in cell.reservations.slice(0, 3)"
              :key="res.id"
              class="badge-item"
              :class="res.estado.toLowerCase()"
              :title="`${formatTimeTo12h(res.hora)} - ${res.nombre_cliente} (${res.numero_personas} pers.)`"
            >
              {{ formatTimeTo12h(res.hora) }} • {{ res.nombre_cliente }}
            </div>
            <div v-if="cell.reservations.length > 3" style="font-size: 0.68rem; color: var(--text-muted); text-align: center;">
              +{{ cell.reservations.length - 3 }} más
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de detalle del día -->
    <section class="day-schedule-section">
      <div class="schedule-header">
        <div>
          <h3>Reservas Programadas: <span>{{ formatDisplayDate(selectedDateStr) }}</span></h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Total: {{ dayReservations.length }} reservas para este día en {{ currentRestaurant.nombre }}
          </p>
        </div>
        <button class="btn btn-primary" @click="$emit('openCreateModal', selectedDateStr)">
          <span><i class="bi bi-plus-lg"></i> Añadir en esta fecha</span>
        </button>
      </div>

      <div v-if="dayReservations.length === 0" class="empty-state">
        <div class="empty-state-icon"><i class="bi bi-calendar-x"></i></div>
        <h4>No hay reservas programadas para este día</h4>
        <p>El administrador puede añadir una nueva reserva usando el botón superior.</p>
      </div>

      <div v-else class="reservations-list">
        <div v-for="res in dayReservations" :key="res.id" class="reservation-card">
          <div class="res-header">
            <div class="res-time-box">
              <span class="res-time"> {{ formatTimeTo12h(res.hora) }}</span>
              <span class="res-client-name">{{ res.nombre_cliente }}</span>
              <span style="color: var(--text-muted); font-size: 0.88rem;">({{ res.numero_personas }} personas)</span>
            </div>
            <span class="status-badge" :class="res.estado">{{ res.estado }}</span>
          </div>

          <div class="res-details-grid">
            <div class="res-detail-item">
              <span class="detail-label">Contacto:</span>
              <span class="detail-value">{{ res.telefono_contacto }}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">{{ res.email_contacto || 'Sin email' }}</span>
            </div>
            <div class="res-detail-item">
              <span class="detail-label">Ocasión:</span>
              <span class="detail-value">{{ getOccasionLabel(res.ocasion) }}</span>
            </div>
            <div class="res-detail-item">
              <span class="detail-label">Personas:</span>
              <span class="detail-value">{{ res.numero_personas }} persona{{ res.numero_personas !== 1 ? 's' : '' }}</span>
            </div>
            <div class="res-detail-item">
              <span class="detail-label">Postre:</span>
              <span class="dessert-pill" :class="res.postre_incluido ? 'yes' : 'no'">
                {{ res.postre_incluido ? 'Sí, incluido' : 'No incluido' }}
              </span>
            </div>
          </div>

          <div v-if="res.descripcion_notas" class="res-notes">
            <strong>Peticiones / Notas:</strong> {{ res.descripcion_notas }}
          </div>

          <div class="res-actions-bar">
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-right: auto; align-self: center;">
              Registrado por: <strong>{{ res.creado_por }}</strong>
              <span v-if="res.ultimo_editor !== res.creado_por"> • Editado por: <strong>{{ res.ultimo_editor }}</strong></span>
            </span>
            <button class="btn btn-secondary" @click="$emit('openEditModal', res)">Editar</button>
            <button v-if="res.estado !== 'CANCELADA'" class="btn btn-danger" @click="$emit('cancelReservation', res)">Cancelar</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { formatTimeTo12h, formatDisplayDate, getOccasionLabel } from '../services/helpers.js'

defineProps({
  monthYearTitle: String,
  calendarGridCells: Array,
  selectedDateStr: String,
  dayReservations: Array,
  currentRestaurant: Object
})

defineEmits(['prevMonth', 'nextMonth', 'goToToday', 'selectDate', 'openCreateModal', 'openEditModal', 'cancelReservation'])
</script>
