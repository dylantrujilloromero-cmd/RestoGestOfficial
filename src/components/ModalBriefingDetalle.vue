<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Briefing — {{ briefing.fecha }}</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div style="margin-bottom:20px;">
          <h4 style="color:var(--accent); margin-bottom:8px;">86 (No hay)</h4>
          <div class="res-notes" style="border-left-color:var(--accent);">{{ briefing.no_hay || 'Sin información' }}</div>
        </div>
        <div style="margin-bottom:20px;">
          <h4 style="color:#b45309; margin-bottom:8px;">85 (Está por acabarse)</h4>
          <div class="res-notes" style="border-left-color:#f59e0b;">{{ briefing.por_acabarse || 'Sin información' }}</div>
        </div>
        <div style="margin-bottom:20px;">
          <h4 style="color:var(--accent-green); margin-bottom:8px;">Impulsar</h4>
          <div class="res-notes" style="border-left-color:var(--accent-green);">{{ briefing.impulsar || 'Sin información' }}</div>
        </div>
        <div>
          <h4 style="color:var(--accent-blue); margin-bottom:8px;">Organización Servicio</h4>
          <div class="res-notes" style="border-left-color:var(--accent-blue);">{{ briefing.organizacion_servicio || 'Sin información' }}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  briefing: Object
})

defineEmits(['close'])
</script>
