<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>📝 Agregar Briefing — {{ currentRestaurant.nombre }}</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label style="font-size:1rem; font-weight:700; color:var(--accent);">86 (No hay)</label>
          <textarea class="form-control" rows="3" placeholder="Escribe lo que no hay disponible..." v-model="formBriefing.no_hay"></textarea>
        </div>
        <div class="form-group">
          <label style="font-size:1rem; font-weight:700; color:#b45309;">85 (Está por acabarse)</label>
          <textarea class="form-control" rows="3" placeholder="Escribe lo que está por acabarse..." v-model="formBriefing.por_acabarse"></textarea>
        </div>
        <div class="form-group">
          <label style="font-size:1rem; font-weight:700; color:var(--accent-green);">Impulsar</label>
          <textarea class="form-control" rows="3" placeholder="Escribe lo que se debe impulsar..." v-model="formBriefing.impulsar"></textarea>
        </div>
        <div class="form-group">
          <label style="font-size:1rem; font-weight:700; color:var(--accent-blue);">Organización Servicio</label>
          <textarea class="form-control" rows="3" placeholder="Escribe la organización del servicio..." v-model="formBriefing.organizacion_servicio"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" @click="$emit('save')">Guardar Briefing</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentRestaurant: Object,
  formBriefing: Object
})

defineEmits(['close', 'save'])
</script>
