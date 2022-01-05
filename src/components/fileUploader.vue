<template>
  <div>
    <!-- {{existingURL}} -->
      <q-btn
      v-if="existingURL && !preventEdit"
        icon="cloud_upload"
        @click="editing = !editing"
        class="absolute-top-right"
        style="z-index: 10000"
        >
          <q-tooltip>Upload or Replace receipt image</q-tooltip>
        </q-btn
      >
    <!-- {{metadata}} -->
    <q-firebase-uploader
      :metadata="metadata"
      color="secondary"
      flat
      bordered
      style="max-width: 500px"
      @uploaded="
        ($event) => {
          readOnly = true
          editing = false
          $emit('uploaded', $event)
        }
      "
      @failed="$emit('failed', $event)"
      @added="$emit('added', $event)"
      @start="$emit('start', $event)"
      auto-upload
      hide-upload-btn
      accept=".jpg, image/*"
      dark
      :label="readOnly ? 'Receipt Submitted' : 'Upload Receipt Image'"
      :readonly="readOnly"
      :disabled="readOnly"
      class="q-mx-auto"
      v-if="(editing || !existingURL) && metadata.customMetadata && metadata.customMetadata.projectId && metadata.customMetadata.transId && !preventEdit"
      ref="receiptUpload"
    />
    <q-img
      :src="existingURL"
      fit="contain"
      @click="open = !open"
      :style="open ? 'height:100%' : 'height:200px'"
      class="q-mx-auto"
      v-else-if="existingURL && !editing"
    >
    <template v-slot:loading>
          <q-spinner-gears color="secordary" />
        </template>
    </q-img>
    <div v-else> No Receipt</div>
  </div>
</template>
<script>
import { ref, defineAsyncComponent } from 'vue'

export default {
  name: 'fileUploader',
  props: {
    metadata: Object,
    existingURL: String,
    preventEdit: Boolean
  },
  emits: ['start', 'uploaded', 'failed', 'added'],
  setup(props) {
    const editing = ref(false)
    const readOnly = ref(false)
    const receiptUpload = ref({})
    const open = ref(false)
    function reset() {
      receiptUpload.value.reset()
    }
    return {
      metadata: props.metadata,
      existingURL: props.existingURL,
      editing,
      readOnly,
      receiptUpload,
      reset,
      open
    }
  },
  components: {
    'q-firebase-uploader': defineAsyncComponent(() =>
      import('./q-firebase-uploader.vue')
    ),
  },
}
</script>
