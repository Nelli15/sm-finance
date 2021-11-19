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
    flat
  >
    <q-tooltip
      anchor="center right"
      self="center left"
      class="bg-accent text-black"
    >
      Receipt
    </q-tooltip>
    <!-- {{props.row.showDialogReceipt}} -->
    <q-dialog v-model="showDialog" style="max-width: 100vw">
      <q-card style="max-width: 100%" dark class="bg-black no-scroll">
        <q-card-section class="text-h6">
          Transaction {{ label }} receipt
        </q-card-section>
        <q-card-section class="no-scroll">
          <!-- {{src}} -->
          <!-- {{receiptUrl}} -->
          <!-- <img
            :src="url"
            alt="No Receipt"
            style="
              max-height: 80vh;
              max-width: 100%;
              image-orientation: from-image;
            "
          /> -->
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
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
  <!-- <q-inner-loading :showDialoging="loading">
    <q-spinner size="50px" color="primary" />
  </q-inner-loading> -->
</template>

<script>
import { mapGetters } from 'vuex'
import { defineAsyncComponent } from 'vue'
// import { dom } from 'quasar'
// const { height } = dom

export default {
  props: {
    id: String,
    label: String,
    loading: Boolean,
    url: String,
  },
  data() {
    return {
      // src: '',
      showDialog: false,
      // disabled: false
      uploading: false,
      readOnly: false,
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
    // async getReceipt () {
    //   // return firebase.auth().onAuthStateChanged(async (user) => {
    //   // console.log(this.idToken)
    //   if (this.idToken > '' && this.id > '') {
    //     const src = `/receipt?projectId=${this.project.id}&id=${this.id}`
    //     const options = {
    //       headers: {
    //         Authorization: `Bearer ${this.idToken}`
    //       }
    //     }
    //     let res = await fetch(src, options)
    //     // console.log(this.id)
    //     // console.log(res.status)
    //     let url = await res.text()
    //     // console.log(url)
    //     this.src = (res.status === 200) ? url : ''
    //     this.loading = false
    //     this.disabled = !(res.status === 200)
    //   }
    //   // })
    // }
  },
  computed: {
    ...mapGetters('projects', ['project']),
    ...mapGetters('auth', ['idToken']),
    disabled() {
      return this.receiptUrl < ''
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
