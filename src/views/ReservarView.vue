<template>
  <div class="reservar-page">
    <header class="hero">
      <span class="hero-badge"><i class="bi bi-cup-hot"></i> Reservas en línea</span>
      <h1>¿En qué restaurante<br>quieres <em>reservar</em>?</h1>
      <p>Elige tu restaurante, mira la carta y aparta tu mesa en un par de minutos.</p>
    </header>

    <div class="steps-bar">
      <div class="step active"><div class="step-num">1</div><span>Elige restaurante</span></div>
      <div class="step-line"></div>
      <div class="step"><div class="step-num">2</div><span>Carta y reserva</span></div>
      <div class="step-line"></div>
      <div class="step"><div class="step-num">3</div><span>Confirma y descarga</span></div>
    </div>

    <!-- CONSULTAR RESERVA -->
    <section class="search-reservation-section">
      <div class="search-reservation-card">
        <div class="search-reservation-title"><span class="icon"><i class="bi bi-search"></i></span> Consultar mi reserva</div>
        <p class="search-reservation-sub">Escribe tu nombre tal como lo registraste para ver el estado de tu reserva.</p>
        <div class="search-bar-row">
          <input type="text" class="form-control search-input" v-model="searchQuery" placeholder="Ej: Juan Pérez" @keyup.enter="buscarReserva">
          <button class="btn btn-primary search-btn" @click="buscarReserva">Buscar</button>
        </div>
        <div v-if="searchResult" class="search-result">
          <div v-if="searchResult.type === 'error'" class="search-result-not-found" v-html="searchResult.message"></div>
          <div v-if="searchResult.type === 'found'">
            <div v-for="res in searchResult.items" :key="res.id" class="search-result-found">
              <div class="search-result-header">
                <div>
                  <div class="search-result-name">{{ res.nombre_cliente }}</div>
                  <div class="search-result-restaurant"><i class="bi bi-shop"></i> {{ getRestaurantName(res.restaurante_id) }}</div>
                </div>
                <span class="search-status-badge" :class="res.estado">{{ statusLabel[res.estado] || res.estado }}</span>
              </div>
              <div class="search-detail-grid">
                <div class="search-detail-item"><label>Fecha</label><span><i class="bi bi-calendar3"></i> {{ res.fecha || '—' }}</span></div>
                <div class="search-detail-item"><label>Hora</label><span><i class="bi bi-clock"></i> {{ formatTimeTo12h(res.hora) }}</span></div>
                <div class="search-detail-item"><label>Personas</label><span><i class="bi bi-people"></i> {{ res.numero_personas || '—' }}</span></div>
                <div class="search-detail-item"><label>Contacto</label><span><i class="bi bi-telephone"></i> {{ res.telefono_contacto || '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RESTAURANTES -->
    <section class="restaurants-grid">
      <article v-for="r in restaurantesActivos" :key="r.id" class="rest-card" :class="bannerClass[r.id] || 'banner-innamorato'">
        <div class="rest-banner">
          <img v-if="getRestaurantLogo(r.id)" class="logo-img" :src="getRestaurantLogo(r.id)" :alt="r.nombre">
          <i v-else class="bi bi-shop banner-icon"></i>
        </div>
        <div class="rest-body">
          <h2 class="rest-name">{{ r.nombre }}</h2>
          <p class="rest-desc">{{ r.descripcion || 'Experiencia gastronómica única.' }}</p>
          <div class="rest-meta">
            <span><i class="bi bi-geo-alt"></i> <strong>{{ r.direccion || 'Consultar dirección' }}</strong></span>
            <span><i class="bi bi-telephone"></i> <strong>{{ r.telefono || '—' }}</strong></span>
            <span><i class="bi bi-clock"></i> <strong>{{ formatTimeTo12h(r.hora_apertura) }} – {{ formatTimeTo12h(r.hora_cierre) }}</strong></span>
            <span><span class="status-dot"></span> Disponible para reservas</span>
          </div>
          <router-link class="btn-reservar" :to="'/formulario-reserva?restaurante=' + r.id">
            Reservar aquí <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>
      </article>
    </section>

    <footer class="page-footer">
      RestoGest © 2026 · <router-link to="/">Acceso administrador</router-link>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataService from '../services/DataService.js'
import { formatTimeTo12h, escapeHtml } from '../services/helpers.js'

const restaurantes = ref(DataService.getRestaurantes())
const restaurantesActivos = computed(() => restaurantes.value.filter(r => r.activo !== false))

const bannerClass = {
  '11111111-1111-1111-1111-111111111111': 'banner-innamorato',
  '22222222-2222-2222-2222-222222222222': 'banner-cielorosa',
  '33333333-3333-3333-3333-333333333333': 'banner-casajuarez'
}
const statusLabel = {
  CONFIRMADA: 'Confirmada',
  PENDIENTE: '⏳ Pendiente',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada'
}

function getRestaurantLogo(restId) {
  return DataService.getRestaurantLogo(restId)
}

function getRestaurantName(restId) {
  const r = restaurantes.value.find(i => i.id === restId)
  return r ? r.nombre : '—'
}

// Búsqueda
const searchQuery = ref('')
const searchResult = ref(null)

async function buscarReserva() {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query || query.length < 3) {
    searchResult.value = { type: 'error', message: 'Por favor ingresa al menos 3 caracteres para buscar.' }
    return
  }

  let encontradas
  try {
    encontradas = await DataService.buscarReservas(query)
  } catch (e) {
    searchResult.value = { type: 'error', message: escapeHtml(e.message) }
    return
  }

  if (encontradas.length === 0) {
    searchResult.value = { type: 'error', message: `No encontramos ninguna reserva con el nombre "<strong>${escapeHtml(query)}</strong>".<br>Verifica el nombre e intenta de nuevo.` }
    return
  }

  searchResult.value = { type: 'found', items: encontradas }
}
</script>

<style scoped>
.reservar-page {
  position: relative; overflow: hidden; width: 100%; min-height: 100vh; background: var(--cream);
  display: flex; flex-direction: column; align-items: center; padding: 56px 20px 60px;
}
/* Manchas suaves de color de fondo */
.reservar-page::before, .reservar-page::after {
  content: ''; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.55; pointer-events: none;
}
.reservar-page::before { width: 420px; height: 420px; background: var(--rose); top: -120px; right: -100px; }
.reservar-page::after { width: 460px; height: 460px; background: var(--lilac); top: 380px; left: -180px; }
.reservar-page > * { position: relative; z-index: 1; }

/* HERO */
.hero { text-align: center; margin-bottom: 34px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px; background: var(--paper); color: var(--lilac-deep);
  border: 1px solid var(--line); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;
  padding: 6px 16px; border-radius: 9999px; margin-bottom: 20px;
}
.hero h1 { font-size: clamp(2.2rem, 5.2vw, 3.4rem); line-height: 1.12; margin-bottom: 14px; }
.hero h1 em { font-style: italic; color: var(--lilac-deep); }
.hero p { font-size: 1.02rem; color: var(--ink-soft); max-width: 480px; margin: 0 auto; line-height: 1.65; }

/* PASOS */
.steps-bar { display: flex; align-items: center; margin-bottom: 38px; flex-wrap: wrap; justify-content: center; gap: 6px 0; }
.step { display: flex; align-items: center; gap: 8px; font-size: 0.84rem; font-weight: 700; color: #aaa6b8; }
.step.active { color: var(--ink); }
.step-num {
  width: 28px; height: 28px; border-radius: 50%; background: var(--sand); color: var(--ink-soft);
  display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 800;
}
.step.active .step-num { background: var(--lilac); color: var(--lilac-ink); }
.step-line { width: 44px; height: 2px; background: var(--line); margin: 0 10px; }

/* CONSULTAR RESERVA */
.search-reservation-section { width: 100%; max-width: 680px; margin: 0 auto 46px; }
.search-reservation-card { background: var(--paper); border: 1px solid var(--line); border-radius: 22px; padding: 26px 30px; box-shadow: var(--shadow-sm); }
.search-reservation-title { font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; }
.search-reservation-title .icon {
  background: var(--lilac-soft); color: var(--lilac-deep); border-radius: 10px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 1rem;
}
.search-reservation-sub { font-size: 0.85rem; color: var(--ink-soft); margin-bottom: 16px; }
.search-bar-row { display: flex; gap: 10px; }
.search-input { flex: 1; }
.search-btn { white-space: nowrap; }
.search-result { margin-top: 18px; }
.search-result-found { background: var(--cream); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 12px; }
.search-result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.search-result-name { font-size: 1.02rem; font-weight: 800; }
.search-result-restaurant { font-size: 0.8rem; color: var(--ink-soft); margin-top: 2px; }
.search-status-badge { padding: 5px 14px; border-radius: 9999px; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.03em; }
.search-status-badge.CONFIRMADA { background: var(--mint); color: var(--mint-ink); }
.search-status-badge.PENDIENTE { background: var(--butter); color: var(--butter-ink); }
.search-status-badge.CANCELADA { background: var(--rose); color: var(--rose-ink); }
.search-status-badge.COMPLETADA { background: var(--sky); color: var(--sky-ink); }
.search-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
.search-detail-item label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.search-detail-item span { font-size: 0.9rem; font-weight: 700; }
.search-result-not-found { background: var(--rose); color: var(--rose-ink); border-radius: var(--radius-md); padding: 14px 18px; text-align: center; font-size: 0.88rem; font-weight: 600; }

/* RESTAURANTES */
.banner-innamorato { --c-bg: #f6c3bd; --c-ink: #5a211c; }
.banner-cielorosa { --c-bg: #f6c6dc; --c-ink: #5d1a3c; }
.banner-casajuarez { --c-bg: #f6e3a1; --c-ink: #5a4806; }

.restaurants-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; width: 100%; max-width: 1080px; }
.rest-card {
  background: var(--paper); border: 1px solid var(--line); border-radius: 24px; overflow: hidden;
  display: flex; flex-direction: column; transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.rest-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(58, 54, 80, 0.12); }
.rest-banner { height: 124px; background: var(--c-bg); display: flex; align-items: center; justify-content: center; font-size: 3.2rem; position: relative; overflow: hidden; }
.banner-icon { font-size: 3rem; color: var(--c-ink); opacity: 0.55; }
.rest-banner .logo-img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
.rest-body { padding: 22px 24px 26px; flex: 1; display: flex; flex-direction: column; }
.rest-name { font-size: 1.3rem; margin: 0 0 6px; }
.rest-desc { font-size: 0.88rem; color: var(--ink-soft); line-height: 1.6; flex: 1; margin-bottom: 16px; }
.rest-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.rest-meta span { font-size: 0.8rem; color: var(--ink-soft); display: flex; align-items: center; gap: 7px; }
.rest-meta i { color: var(--c-ink); opacity: 0.7; }
.rest-meta strong { color: var(--ink); font-weight: 700; }

.btn-reservar {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  background: var(--c-bg); color: var(--c-ink); font-size: 0.92rem; font-weight: 800;
  padding: 12px 20px; border-radius: 14px; text-decoration: none; transition: all 0.2s;
}
.btn-reservar:hover { background: color-mix(in srgb, var(--c-bg) 85%, #000); color: var(--c-ink); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6fcf9d; display: inline-block; animation: pulse 2s infinite; }

.page-footer { margin-top: 48px; text-align: center; color: var(--ink-soft); font-size: 0.8rem; }
.page-footer a { color: var(--lilac-deep); font-weight: 700; text-decoration: none; }

@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } }
@media (max-width: 520px) { .search-detail-grid { grid-template-columns: 1fr; } .search-reservation-card { padding: 22px 18px; } }
</style>
