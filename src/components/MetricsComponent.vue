<template>
  <section class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon gold">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c59b27" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <div class="metric-info"><h3>{{ metricTotalHoy }}</h3><p>Reservas para Hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon green">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="metric-info"><h3>{{ metricConfirmadasHoy }}</h3><p>Confirmadas Hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2980b9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <div class="metric-info"><h3>{{ metricComensalesHoy }}</h3><p>Personas Esperadas Hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon red">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#aa1807" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div class="metric-info"><h3>{{ formatTimeTo12h(currentRestaurant.hora_apertura) }} - {{ formatTimeTo12h(currentRestaurant.hora_cierre) }}</h3><p>Horario de Atención</p></div>
    </div>
  </section>
</template>
<script setup>
import { formatTimeTo12h } from '../services/helpers.js'
defineProps(['metricTotalHoy','metricConfirmadasHoy','metricComensalesHoy','currentRestaurant'])
</script>
