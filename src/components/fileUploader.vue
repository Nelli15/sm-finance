<template>
  <div>
    <!-- {{ existingURL }}<br />
    {{ editing }} -->
    <q-btn
      v-if="existingURL"
      icon="cloud_upload"
      @click="editing = !editing"
      class="q-mx-auto"
      ><q-tooltip>Replace receipt image</q-tooltip></q-btn
    >
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
      v-if="editing || !existingURL"
    />
    <q-img
      :src="existingURL"
      fit="contain"
      @click="open = !open"
      :style="open ? 'height:100%' : 'height:200px'"
      class="q-mx-auto"
      v-if="existingURL && !editing"
      spinner-color="secordary"
    />
  </div>
</template>
<script>
import { ref, defineAsyncComponent } from 'vue'

export default {
  name: 'fileUploader',
  props: {
    metadata: Object,
    existingURL: String,
  },
  emits: ['start', 'uploaded', 'failed', 'added'],
  setup(props) {
    const editing = ref(false)
    const readOnly = ref(false)

    return {
      metadata: props.metadata,
      existingURL: props.existingURL,
      editing,
      readOnly,
    }
  },
  components: {
    'q-firebase-uploader': defineAsyncComponent(() =>
      import('./q-firebase-uploader.vue')
    ),
  },
}
</script>
