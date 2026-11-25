<template>
  <div class="reservar-page">
    <!-- HERO -->
    <div class="hero">
      <div class="hero-badge">🍽️ Sistema de Reservas</div>
      <h1>¿En cuál <span>restaurante</span><br>deseas reservar?</h1>
      <p>Selecciona el restaurante de tu preferencia para continuar con tu reserva. En el siguiente paso podrás ver la carta y elegir tu fecha.</p>
    </div>

    <!-- PASOS -->
    <div class="steps-bar">
      <div class="step active">
        <div class="step-num">1</div>
        <span>Elige restaurante</span>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-num">2</div>
        <span>Ver carta y reservar</span>
      </div>
      <div class="step-line"></div>
      <div class="step">
        <div class="step-num">3</div>
        <span>Confirmar y descargar</span>
      </div>
    </div>

    <!-- BÚSQUEDA DE ESTADO DE RESERVA -->
    <div class="search-reservation-section">
      <div class="search-reservation-card">
        <div class="search-reservation-title">
          <span class="icon">🔍</span>
          Consultar mi Reserva
        </div>
        <p class="search-reservation-sub">Ingresa tu nombre completo tal como lo registraste para ver el estado de tu reserva</p>
        <div class="search-bar-row">
          <input
            type="text"
            class="search-input"
            v-model="searchQuery"
            placeholder="Ej: Juan Pérez"
            @keyup.enter="buscarReserva"
          >
          <button class="search-btn" @click="buscarReserva">Buscar Reserva</button>
        </div>
        <!-- Resultado -->
        <div v-if="searchResult" class="search-result" style="margin-top:18px;">
          <div v-if="searchResult.type === 'error'" class="search-result-not-found" v-html="searchResult.message"></div>
          <div v-if="searchResult.type === 'found'">
            <div v-for="res in searchResult.items" :key="res.id" class="search-result-found" style="margin-bottom:12px;">
              <div class="search-result-header">
                <div>
                  <div class="search-result-name">{{ res.nombre_cliente }}</div>
                  <div class="search-result-restaurant">🍽️ {{ getRestaurantName(res.restaurante_id) }}</div>
                </div>
                <span class="search-status-badge" :class="res.estado">{{ statusLabel[res.estado] || res.estado }}</span>
              </div>
              <div class="search-detail-grid">
                <div class="search-detail-item"><label>Fecha</label><span>📅 {{ res.fecha || '—' }}</span></div>
                <div class="search-detail-item"><label>Hora</label><span>🕐 {{ formatTimeTo12h(res.hora) }}</span></div>
                <div class="search-detail-item"><label>Personas</label><span>👥 {{ res.numero_personas || '—' }}</span></div>
                <div class="search-detail-item"><label>Contacto</label><span>📞 {{ res.telefono_contacto || '—' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GRID DE RESTAURANTES -->
    <div class="restaurants-grid">
      <div v-for="r in restaurantesActivos" :key="r.id" class="rest-card">
        <div class="rest-banner" :class="bannerClass[r.id] || 'banner-innamorato'">
          <img v-if="getRestaurantLogo(r.id)" class="logo-img" :src="getRestaurantLogo(r.id)" :alt="r.nombre">
          <span v-else class="emoji-fallback">{{ bannerEmoji[r.id] || '🍽️' }}</span>
          <div v-if="!getRestaurantLogo(r.id)" class="rest-logo-overlay">
            <span>{{ bannerEmoji[r.id] || '🍽️' }}</span>
          </div>
        </div>
        <div class="rest-body">
          <div class="rest-name">{{ r.nombre }}</div>
          <div class="rest-desc">{{ r.descripcion || 'Experiencia gastronómica única.' }}</div>
          <div class="rest-meta">
            <span>📍 <strong>{{ r.direccion || 'Consultar dirección' }}</strong></span>
            <span>📞 <strong>{{ r.telefono || '—' }}</strong></span>
            <span>🕐 <strong>{{ formatTimeTo12h(r.hora_apertura) }} – {{ formatTimeTo12h(r.hora_cierre) }}</strong></span>
            <span><span class="status-dot"></span> Disponible para reservas</span>
          </div>
          <router-link class="btn-reservar" :to="'/formulario-reserva?restaurante=' + r.id">
            Reservar en este restaurante →
          </router-link>
        </div>
      </div>
    </div>

    <div class="page-footer">
      RestoGest &copy; 2026 &nbsp;•&nbsp;
      <router-link to="/">Acceso Administrador</router-link>
    </div>
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
const bannerEmoji = {
  '11111111-1111-1111-1111-111111111111': '🍝',
  '22222222-2222-2222-2222-222222222222': '🌸',
  '33333333-3333-3333-3333-333333333333': '🌮'
}
const statusLabel = {
  CONFIRMADA: '✅ Confirmada',
  PENDIENTE: '⏳ Pendiente',
  CANCELADA: '❌ Cancelada',
  COMPLETADA: '🏁 Completada'
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
    searchResult.value = { type: 'error', message: `❌ No encontramos ninguna reserva con el nombre "<strong>${escapeHtml(query)}</strong>".<br>Verifica el nombre e intenta de nuevo.` }
    return
  }

  searchResult.value = { type: 'found', items: encontradas }
}
</script>

<style scoped>
.reservar-page {
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #1a2238 0%, #2c3652 40%, #1a2238 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 60px;
}

/* HERO */
.hero { text-align: center; margin-bottom: 48px; animation: fadeDown 0.6s ease; }
.hero-badge {
  display: inline-block; background: rgba(197,155,39,0.18); border: 1px solid rgba(197,155,39,0.4);
  color: #c59b27; font-size: 0.78rem; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 6px 16px; border-radius: 9999px; margin-bottom: 18px;
}
.hero h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 14px; }
.hero h1 span { color: #c59b27; }
.hero p { font-size: 1rem; color: rgba(255,255,255,0.65); max-width: 520px; margin: 0 auto; line-height: 1.7; }

/* STEPS */
.steps-bar { display: flex; align-items: center; gap: 0; margin-bottom: 40px; animation: fadeDown 0.5s ease; }
.step { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.45); }
.step.active { color: #fff; }
.step-num {
  width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700;
}
.step.active .step-num { background: #c59b27; color: #fff; }
.step-line { width: 50px; height: 2px; background: rgba(255,255,255,0.15); margin: 0 10px; }

/* SEARCH */
.search-reservation-section { width: 100%; max-width: 700px; margin: 0 auto 48px; animation: fadeUp 0.65s ease; }
.search-reservation-card {
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
  border-radius: 18px; padding: 28px 32px; backdrop-filter: blur(10px);
}
.search-reservation-title { font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
.search-reservation-title .icon {
  background: rgba(197,155,39,0.2); border: 1px solid rgba(197,155,39,0.4); border-radius: 8px;
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.search-reservation-sub { font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-bottom: 18px; }
.search-bar-row { display: flex; gap: 10px; }
.search-input {
  flex: 1; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.18);
  border-radius: 10px; padding: 12px 16px; font-family: inherit; font-size: 0.9rem;
  color: #fff; outline: none; transition: all 0.2s;
}
.search-input::placeholder { color: rgba(255,255,255,0.35); }
.search-input:focus { border-color: #c59b27; background: rgba(255,255,255,0.14); }
.search-btn {
  background: linear-gradient(90deg, #c59b27, #9e7916); color: #fff; border: none;
  border-radius: 10px; padding: 12px 22px; font-family: inherit; font-size: 0.88rem;
  font-weight: 700; cursor: pointer; transition: all 0.22s; white-space: nowrap;
}
.search-btn:hover { background: linear-gradient(90deg, #d4a933, #c59b27); transform: scale(1.02); }

.search-result-found { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 20px 22px; }
.search-result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
.search-result-name { font-size: 1rem; font-weight: 800; color: #1a2238; }
.search-result-restaurant { font-size: 0.78rem; color: #718096; margin-top: 2px; }
.search-status-badge { padding: 6px 14px; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px; }
.search-status-badge.CONFIRMADA { background: #d1fae5; color: #065f46; }
.search-status-badge.PENDIENTE { background: #fef3c7; color: #92400e; }
.search-status-badge.CANCELADA { background: #fee2e2; color: #991b1b; }
.search-status-badge.COMPLETADA { background: #e0e7ff; color: #3730a3; }
.search-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
.search-detail-item label { display: block; font-size: 0.7rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.search-detail-item span { font-size: 0.88rem; font-weight: 600; color: #1a2238; }
.search-result-not-found {
  background: rgba(254,226,226,0.15); border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px; padding: 16px 20px; text-align: center; color: rgba(255,255,255,0.75); font-size: 0.88rem;
}

/* RESTAURANT GRID */
.restaurants-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; width: 100%; max-width: 1100px; animation: fadeUp 0.7s ease; }
.rest-card {
  background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.10);
  cursor: pointer; transition: transform 0.28s ease, box-shadow 0.28s ease;
  display: flex; flex-direction: column; border: 2px solid transparent; position: relative;
}
.rest-card:hover { transform: translateY(-6px); box-shadow: 0 18px 50px rgba(0,0,0,0.20); border-color: #c59b27; }
.rest-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #c59b27, #9e7916); opacity: 0; transition: opacity 0.28s; }
.rest-card:hover::before { opacity: 1; }

.rest-banner { height: 130px; display: flex; align-items: center; justify-content: center; font-size: 3.5rem; position: relative; overflow: hidden; }
.rest-banner .logo-img { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }
.rest-banner .emoji-fallback { position: relative; z-index: 1; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25)); }
.banner-innamorato { background: linear-gradient(135deg, #ff6b6b, #c0392b); }
.banner-cielorosa { background: linear-gradient(135deg, #fd79a8, #e84393); }
.banner-casajuarez { background: linear-gradient(135deg, #fdcb6e, #e17055); }

.rest-logo-overlay {
  position: absolute; bottom: 10px; left: 10px; width: 54px; height: 54px;
  border-radius: 12px; overflow: hidden; background: #fff; border: 2px solid rgba(255,255,255,0.6);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
}

.rest-body { padding: 22px 22px 26px; flex: 1; display: flex; flex-direction: column; }
.rest-name { font-size: 1.1rem; font-weight: 800; color: #1a2238; margin-bottom: 6px; letter-spacing: 0.5px; }
.rest-desc { font-size: 0.85rem; color: #718096; line-height: 1.6; flex: 1; margin-bottom: 16px; }
.rest-meta { display: flex; flex-direction: column; gap: 5px; margin-bottom: 18px; }
.rest-meta span { font-size: 0.78rem; color: #718096; display: flex; align-items: center; gap: 6px; }
.rest-meta strong { color: #2d3748; }

.btn-reservar {
  display: block; width: 100%; background: linear-gradient(90deg, #c59b27, #9e7916);
  color: #fff; font-family: inherit; font-size: 0.9rem; font-weight: 700;
  padding: 12px 20px; border: none; border-radius: 10px; cursor: pointer;
  text-align: center; letter-spacing: 0.5px; transition: all 0.22s; text-decoration: none;
}
.btn-reservar:hover { background: linear-gradient(90deg, #d4a933, #c59b27); transform: scale(1.02); box-shadow: 0 6px 18px rgba(197,155,39,0.35); }

.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #27ae60; display: inline-block; margin-right: 4px; animation: pulse 2s infinite; }

.page-footer { margin-top: 50px; text-align: center; color: rgba(255,255,255,0.35); font-size: 0.78rem; }
.page-footer a { color: #c59b27; text-decoration: none; }

@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.6; } }
</style>
