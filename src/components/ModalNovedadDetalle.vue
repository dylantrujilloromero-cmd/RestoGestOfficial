<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>📋 Detalle de Novedad</h3>
        <button class="modal-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="res-details-grid">
          <div class="res-detail-item">
            <span class="detail-label">Realizada por:</span>
            <span class="detail-value">{{ novedad.nombre_realiza }}</span>
          </div>
          <div class="res-detail-item">
            <span class="detail-label">Dirigida a:</span>
            <span class="detail-value">{{ novedad.nombre_dirigida }}</span>
          </div>
          <div class="res-detail-item">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">{{ novedad.fecha }}</span>
          </div>
          <div class="res-detail-item">
            <span class="detail-label">Prioridad:</span>
            <span class="status-badge" :class="novedad.prioridad === 'Alta' ? 'CANCELADA' : novedad.prioridad === 'Media' ? 'PENDIENTE' : 'CONFIRMADA'">{{ novedad.prioridad }}</span>
          </div>
        </div>
        <div style="margin-top:16px;">
          <span class="detail-label">Asunto:</span>
          <h3 style="margin-top:4px;">{{ novedad.asunto }}</h3>
        </div>
        <div style="margin-top:12px;">
          <span class="detail-label">Tipo:</span>
          <span class="status-badge" style="background:#e0e7ff; color:#3730a3;">{{ novedad.tipo }}</span>
        </div>
        <div v-if="novedad.descripcion" class="res-notes" style="margin-top:16px;">
          <strong>Descripción:</strong> {{ novedad.descripcion }}
        </div>
        <div v-if="novedad.imagen_preview" style="margin-top:16px;">
          <span class="detail-label">Imagen adjunta:</span>
          <img :src="novedad.imagen_preview" style="max-width:100%; margin-top:8px; border-radius:8px; border:1px solid var(--border);" alt="Imagen novedad">
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
  novedad: Object
})

defineEmits(['close'])
</script>
