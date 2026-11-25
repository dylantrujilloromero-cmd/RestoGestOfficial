<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Agregar Novedad — {{ currentRestaurant.nombre }}</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Nombre de quien realiza la novedad *</label>
            <input type="text" class="form-control" placeholder="Nombre completo" v-model="formNovedad.nombre_realiza">
          </div>
          <div class="form-group">
            <label>Nombre a quien va dirigida *</label>
            <input type="text" class="form-control" placeholder="Nombre del destinatario" v-model="formNovedad.nombre_dirigida">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha *</label>
            <input type="date" class="form-control" v-model="formNovedad.fecha">
          </div>
          <div class="form-group">
            <label>Prioridad *</label>
            <select class="form-control" v-model="formNovedad.prioridad">
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Asunto *</label>
          <input type="text" class="form-control" placeholder="Asunto de la novedad" v-model="formNovedad.asunto">
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea class="form-control" rows="4" placeholder="Describe la novedad..." v-model="formNovedad.descripcion"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Tipo de Novedad *</label>
            <select class="form-control" v-model="formNovedad.tipo">
              <option value="Novedad del Personal">Novedad del Personal</option>
              <option value="Novedad del Establecimiento">Novedad del Establecimiento</option>
            </select>
          </div>
          <div class="form-group">
            <label>Agregar Imagen (JPG, PNG)</label>
            <input type="file" class="form-control" accept="image/jpeg,image/png" @change="$emit('imageUpload', $event)">
            <img v-if="formNovedad.imagen_preview" :src="formNovedad.imagen_preview" style="max-width:120px; margin-top:8px; border-radius:8px; border:1px solid var(--border);" alt="Preview">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="$emit('save')">Guardar Novedad</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentRestaurant: Object,
  formNovedad: Object
})

defineEmits(['close', 'save', 'imageUpload'])
</script>
