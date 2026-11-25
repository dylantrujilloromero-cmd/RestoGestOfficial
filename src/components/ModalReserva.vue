<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }} — {{ currentRestaurant.nombre }}</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Fecha de Reserva *</label>
            <input type="date" class="form-control" v-model="formReserva.fecha" required>
          </div>
          <div class="form-group">
            <label>Hora *</label>
            <input type="time" class="form-control" v-model="formReserva.hora" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Nombre Completo del Cliente *</label>
            <input type="text" class="form-control" placeholder="Ej: Juan Pérez" v-model="formReserva.nombre_cliente" required>
          </div>
          <div class="form-group">
            <label>Número de Personas *</label>
            <input type="number" min="1" max="50" class="form-control" v-model="formReserva.numero_personas" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Teléfono de Contacto * (solo números, máx. 10)</label>
            <input type="tel" class="form-control" placeholder="9998887770" v-model="formReserva.telefono_contacto" maxlength="10" @input="$emit('filterPhone')" required>
          </div>
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" class="form-control" placeholder="cliente@correo.com" v-model="formReserva.email_contacto">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Ocasión</label>
            <select class="form-control" v-model="formReserva.ocasion">
              <option v-for="oc in ocasionesDisponibles" :key="oc.id" :value="oc.id">{{ oc.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Plan</label>
            <select class="form-control" v-model="formReserva.plan" @change="$emit('planChanged')">
              <option v-for="p in planesSelector" :key="p.id" :value="p.id">{{ p.label }}</option>
            </select>
          </div>
        </div>
        <div class="switch-container">
          <div class="switch-label">
            ¿Postre Incluido en la Reserva?
            <div style="font-size: 0.75rem; font-weight: 400; color: #92400e;">Activa si incluye postre</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="formReserva.postre_incluido">
            <span class="slider"></span>
          </label>
        </div>
        <div class="form-group" v-if="isEdit">
          <label>Estado de la Reserva</label>
          <select class="form-control" v-model="formReserva.estado">
            <option value="CONFIRMADA">CONFIRMADA</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="COMPLETADA">FINALIZADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>
        <div class="form-group" v-else>
          <label>Estado de la Reserva</label>
          <select class="form-control" v-model="formReserva.estado">
            <option value="CONFIRMADA">CONFIRMADA</option>
            <option value="PENDIENTE">PENDIENTE</option>
          </select>
        </div>
        <div class="form-group">
          <label>Descripción / Peticiones Especiales</label>
          <textarea class="form-control" rows="3" placeholder="Ej: Mesa decorada, alergia a mariscos..." v-model="formReserva.descripcion_notas"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="$emit('save')">{{ isEdit ? 'Guardar Cambios' : 'Guardar en Calendario' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  currentRestaurant: Object,
  formReserva: Object,
  ocasionesDisponibles: Array,
  planesSelector: Array,
  isEdit: { type: Boolean, default: false }
})

defineEmits(['close', 'save', 'filterPhone', 'planChanged'])
</script>
