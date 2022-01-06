<template>
  <q-btn
    :icon="
      url > '' && url.startsWith('https://')
        ? 'receipt'
        : 'img:../icons/no-receipt.png'
    "
    @click="showDialog = !showDialog"
    :loading="loading"
    dense
  >
    <template v-slot:loading>
      <q-spinner-gears color="secordary" />
    </template>
    <q-tooltip
      anchor="center right"
      self="center left"
      class="bg-accent text-black"
    >
      Receipt
    </q-tooltip>
    <q-dialog v-model="showDialog" style="max-width: 100vw">
      <q-card style="max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Transaction {{ label }} receipt</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="no-scroll">
          <fileUploader
            :metadata="{
              customMetadata: {
                projectId: project.id,
                transId: id,
                expiry: expiry(1),
              },
            }"
            ref="transUpload"
            @uploaded="onUploaded"
            @failed="onFailed"
            @added="onAdded"
            @start="onStart"
            :existingURL="url"
            class="q-mx-auto"
            :preventEdit="preventEdit"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import { mapGetters } from 'vuex'
import { defineAsyncComponent } from 'vue'

export default {
  // props: ['id', 'label', 'loading', 'url', 'preventEdit'],
  props: {
    id: String,
    label: String,
    url: String,
    preventEdit: Boolean,
  },
  data() {
    return {
      // src: '',
      showDialog: false,
      uploading: false,
      readOnly: false,
      open: false,
    }
  },
  created() {
    // this.getReceipt()
  },
  methods: {
    expiry(numDays) {
      var date = new Date()
      date.setDate(date.getDate() + 1)
      return date
    },
    onAdded(files) {
      // console.log('file added', files)
      // files[0].name = 'blah.jpeg'
    },
    onStart(event) {
      // console.log('upload started', event)
      this.uploading = true
    },
    onUploaded(event) {
      // console.log('file uploaded', event)
      this.readOnly = true
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Receipt Uploaded',
      })
      this.newTrans.receipt = true
      this.uploading = false
    },
    onFailed(event) {
      // console.log('file upload failed', event)
      this.$q.notify({
        color: 'negative',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Upload Failed',
      })
      this.uploading = false
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
    loading() {
      return this.url === 'loading'
    },
    // receiptUrl () {
    //   if (this.url > '') {
    //     return this.url
    //   } else {
    //     return this.getReceipt()
    //   }
    // }
    // imgHeight () {
    //   // console.log(height(window), height(window) * 0.8)
    //   return height(window) * 0.8
    // },
    // imgWidth () {
    //   // console.log((height(window) * 0.8) / 9 * 16)
    //   return (height(window) * 0.8) / 9 * 16
    // }
  },
  components: {
    fileUploader: defineAsyncComponent(() => import('./fileUploader.vue')),
  },
}
</script>
