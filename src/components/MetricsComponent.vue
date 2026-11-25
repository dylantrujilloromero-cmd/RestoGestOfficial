<template>
  <section class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon gold"><i class="bi bi-calendar-check"></i></div>
      <div class="metric-info"><h3>{{ metricTotalHoy }}</h3><p>Reservas para hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon green"><i class="bi bi-check2-circle"></i></div>
      <div class="metric-info"><h3>{{ metricConfirmadasHoy }}</h3><p>Confirmadas hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon blue"><i class="bi bi-people"></i></div>
      <div class="metric-info"><h3>{{ metricComensalesHoy }}</h3><p>Personas esperadas hoy</p></div>
    </div>
    <div class="metric-card">
      <div class="metric-icon red"><i class="bi bi-clock"></i></div>
      <div class="metric-info"><h3 class="fs-5">{{ formatTimeTo12h(currentRestaurant.hora_apertura) }} – {{ formatTimeTo12h(currentRestaurant.hora_cierre) }}</h3><p>Horario de atención</p></div>
    </div>
  </section>
</template>
<script setup>
import { formatTimeTo12h } from '../services/helpers.js'
defineProps(['metricTotalHoy','metricConfirmadasHoy','metricComensalesHoy','currentRestaurant'])
</script>
