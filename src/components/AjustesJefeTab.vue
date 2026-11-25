<template>
  <div>
    <!-- Sección: Gestión de Restaurantes -->
    <h2 style="margin-bottom: 6px;">Ajustes de Restaurantes</h2>
    <p style="color: var(--text-muted); margin-bottom: 20px;">
      Modifica información, horarios y capacidad de cada restaurante.
    </p>

    <div class="jefe-panel-grid">
      <div v-for="r in restaurantes" :key="r.id" class="restaurant-edit-card">
        <div class="rest-card-header">
          <h3>{{ r.nombre }}</h3>
          <span class="status-badge" :class="r.activo ? 'CONFIRMADA' : 'CANCELADA'">
            {{ r.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>

        <!-- Logo del restaurante -->
        <div class="rest-logo-section">
          <label class="rest-logo-label">Logo del Restaurante:</label>
          <div style="display: flex; align-items: center; gap: 12px;">
            <img v-if="getRestaurantLogo(r.id)" :src="getRestaurantLogo(r.id)" alt="Logo" class="rest-logo-thumb">
            <div v-else class="rest-logo-thumb-placeholder"><i class="bi bi-shop"></i></div>
            <label class="btn btn-secondary" style="cursor:pointer; margin: 0;">
              Subir Logo
              <input type="file" accept="image/*" @change="$emit('onRestaurantLogoUpload', $event, r.id)" style="display:none;">
            </label>
            <button v-if="getRestaurantLogo(r.id)" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.78rem;" @click="$emit('removeRestaurantLogo', r.id)">Quitar</button>
          </div>
        </div>

        <!-- Carta PDF -->
        <div class="rest-carta-section">
          <label class="rest-logo-label">Carta / Menú (PDF):</label>
          <div style="display: flex; align-items: center; gap: 12px;">
            <label class="btn btn-secondary" style="cursor:pointer; margin: 0;">
              Subir PDF
              <input type="file" accept="application/pdf" @change="$emit('onCartaUpload', $event, r.id)" style="display:none;">
            </label>
            <a v-if="getRestaurantCarta(r.id)" :href="getRestaurantCarta(r.id)" target="_blank" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.8rem; text-decoration: none;">
              Ver Carta
            </a>
            <button v-if="getRestaurantCarta(r.id)" class="btn btn-danger" style="padding: 6px 12px; font-size: 0.78rem;" @click="$emit('removeRestaurantCarta', r.id)">Quitar PDF</button>
            <span v-if="!getRestaurantCarta(r.id)" style="font-size: 0.8rem; color: var(--text-muted);">Sin carta cargada</span>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: #4a5568;">{{ r.descripcion }}</p>
        <div style="font-size: 0.82rem; color: var(--text-muted);">
          {{ r.direccion }}<br>
          {{ r.telefono }}<br>
          Horario: {{ formatTimeTo12h(r.hora_apertura) }} - {{ formatTimeTo12h(r.hora_cierre) }}<br>
          Capacidad: {{ r.capacidad_maxima }} personas
        </div>
        <button class="btn btn-secondary" @click="$emit('startEditRestaurant', r)">
          Ajustar Datos
        </button>
      </div>
    </div>

    <!-- Formulario edición de restaurante -->
    <div v-if="editRestaurantForm.id" style="margin-top: 30px; background: #fff; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
      <h3>Editando: {{ editRestaurantForm.nombre }}</h3>
      <div class="modal-body" style="padding: 16px 0;">
        <div class="form-row">
          <div class="form-group">
            <label>Nombre del Restaurante:</label>
            <input class="form-control" v-model="editRestaurantForm.nombre">
          </div>
          <div class="form-group">
            <label>Teléfono:</label>
            <input class="form-control" v-model="editRestaurantForm.telefono">
          </div>
        </div>
        <div class="form-group">
          <label>Dirección:</label>
          <input class="form-control" v-model="editRestaurantForm.direccion">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Hora Apertura:</label>
            <input type="time" class="form-control" v-model="editRestaurantForm.hora_apertura">
          </div>
          <div class="form-group">
            <label>Hora Cierre:</label>
            <input type="time" class="form-control" v-model="editRestaurantForm.hora_cierre">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Capacidad Máxima:</label>
            <input type="number" class="form-control" v-model="editRestaurantForm.capacidad_maxima">
          </div>
          <div class="form-group" style="justify-content: center;">
            <label>Estado:</label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 8px;">
              <input type="checkbox" v-model="editRestaurantForm.activo">
              <span>Restaurante Activo</span>
            </label>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn btn-secondary" @click="$emit('cancelEditRestaurant')">Cancelar</button>
        <button class="btn btn-primary" @click="$emit('saveRestaurantChanges')">Guardar Ajustes</button>
      </div>
    </div>

    <!-- Sección: Gestión de Cuentas de Administrador -->
    <div class="accounts-section">
      <div class="accounts-header">
        <div>
          <h2>Gestión de Cuentas de Administrador</h2>
          <p style="color: var(--text-muted); margin-top: 4px;">
            Crea o elimina cuentas para que los administradores inicien sesión en sus restaurantes.
          </p>
        </div>
        <button class="btn btn-primary" @click="$emit('openAddUserForm')" v-if="!showAddUserForm">
          Nueva Cuenta
        </button>
      </div>

      <!-- Formulario para nueva cuenta -->
      <div v-if="showAddUserForm" class="add-user-form">
        <h3 style="margin-bottom: 16px;">Crear Nueva Cuenta de Administrador</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input type="text" class="form-control" placeholder="Ej: Ana García" v-model="newUserForm.nombre_completo">
          </div>
          <div class="form-group">
            <label>Correo Electrónico *</label>
            <input type="email" class="form-control" placeholder="correo@ejemplo.com" v-model="newUserForm.email">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contraseña *</label>
            <input type="password" class="form-control" placeholder="Mínimo 6 caracteres" v-model="newUserForm.password">
          </div>
          <div class="form-group">
            <label>Restaurante Asignado *</label>
            <select class="form-control" v-model="newUserForm.restaurante_id">
              <option v-for="r in restaurantes" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
          </div>
        </div>
        <div v-if="newUserForm.error" class="login-error" style="margin-bottom: 12px;">
          {{ newUserForm.error }}
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button class="btn btn-secondary" @click="$emit('cancelAddUser')">Cancelar</button>
          <button class="btn btn-primary" @click="$emit('saveNewUser')">Crear Cuenta</button>
        </div>
      </div>

      <!-- Lista de administradores existentes -->
      <div class="users-list">
        <div v-for="user in adminUsuarios" :key="user.id" class="user-card">
          <div class="user-card-info">
            <div class="user-avatar"><i class="bi bi-person-fill"></i></div>
            <div>
              <div class="user-card-name">{{ user.nombre_completo }}</div>
              <div class="user-card-email">{{ user.email }}</div>
              <div class="user-card-rest">
                {{ getRestaurantName(user.restaurante_id) }}
              </div>
            </div>
          </div>
          <div class="user-card-actions">
            <span class="status-badge CONFIRMADA">Admin</span>
            <button class="btn btn-danger" @click="$emit('deleteUser', user.id)">Eliminar Cuenta</button>
          </div>
        </div>
        <div v-if="adminUsuarios.length === 0" class="empty-state" style="padding: 30px 0;">
          <div class="empty-state-icon"><i class="bi bi-people"></i></div>
          <h4>No hay cuentas de administrador aún</h4>
          <p>Usa el botón "Nueva Cuenta" para crear la primera.</p>
        </div>
      </div>
    </div>

    <!-- Sección: Mensaje para Clientes en Formulario Público -->
    <div class="accounts-section" style="margin-top: 30px;">
      <div class="accounts-header">
        <div>
          <h2>📢 Mensaje para Clientes</h2>
          <p style="color: var(--text-muted); margin-top: 4px;">
            Este mensaje se muestra en el formulario de reserva público de cada restaurante. Puedes indicar instrucciones de pago, políticas de reserva, etc.
          </p>
        </div>
        <router-link to="/reservar" target="_blank" class="btn btn-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
          🔗 Ver Formulario Público
        </router-link>
      </div>

      <div v-for="r in restaurantes" :key="'msg-'+r.id" style="background:#fff; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px 22px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
          <div>
            <h4 style="color:var(--secondary); font-size:0.95rem; font-weight:700;">{{ r.nombre }}</h4>
            <p style="font-size:0.78rem; color:var(--text-muted);">{{ r.descripcion }}</p>
          </div>
          <span class="status-badge CONFIRMADA" style="font-size:0.72rem;">Activo</span>
        </div>
        <div class="form-group">
          <label style="font-size:0.8rem;">Mensaje visible para el cliente en el formulario de reserva:</label>
          <textarea
            class="form-control"
            rows="4"
            :value="getAdminMsg(r.id)"
            @input="$emit('setAdminMsg', r.id, $event.target.value)"
            placeholder="Ej: Para confirmar tu reserva, realiza tu pago y adjunta el comprobante..."
          ></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <button class="btn btn-primary" style="padding:8px 20px; font-size:0.82rem;" @click="$emit('saveAdminMsg', r.id)">
            💾 Guardar Mensaje
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTimeTo12h } from '../services/helpers.js'

const props = defineProps({
  restaurantes: Array,
  adminUsuarios: Array,
  editRestaurantForm: Object,
  showAddUserForm: Boolean,
  newUserForm: Object,
  adminMessages: Object,
  restaurantLogos: Object,
  restaurantCartas: Object
})

defineEmits([
  'startEditRestaurant', 'saveRestaurantChanges', 'cancelEditRestaurant',
  'openAddUserForm', 'cancelAddUser', 'saveNewUser', 'deleteUser',
  'getRestaurantLogo', 'onRestaurantLogoUpload', 'removeRestaurantLogo',
  'getRestaurantCarta', 'onCartaUpload', 'removeRestaurantCarta',
  'getAdminMsg', 'setAdminMsg', 'saveAdminMsg'
])

function getRestaurantLogo(restId) {
  return props.restaurantLogos[restId] || ''
}

function getRestaurantCarta(restId) {
  return props.restaurantCartas[restId] || ''
}

function getAdminMsg(restId) {
  return props.adminMessages[restId] || ''
}

function getRestaurantName(restId) {
  const r = props.restaurantes.find(i => i.id === restId)
  return r ? r.nombre : 'Restaurante'
}
</script>
