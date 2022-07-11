<script>
import { createUploaderComponent } from 'quasar'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage'
import { $firebase } from './../scripts/firebase.js'
import { computed, ref } from 'vue'
import { v4 as uid } from 'uuid'
import { useStore } from 'vuex'

export default createUploaderComponent({
  name: 'q-firebase-uploader',
  props: {
    metadata: Object,
  },
  emits: ['start', 'uploading', 'uploaded', 'failed', 'added'],
  injectPlugin({ props, emit, helpers }) {
    // console.log(helpers)
    const store = useStore()
    const currentUser = computed(() => store.getters['auth/user'])
    const uploading = ref(false)
    const isUploading = computed(() => {
      return uploading
    })

    // [REQUIRED]
    // abort and clean up any process
    // that is in progress
    function abort() {
      // ...
    }

    // [REQUIRED]
    function upload() {
      // if (canUpload === false) {
      //   return
      // }
      emit('start')
      // isBusy = true
      helpers.queuedFiles.value.forEach((file) => {
        // var meta = file.metadata
        // meta.customMetadata = metadata
        console.log({
          customMetadata: {
            ...props.metadata.customMetadata,
            uid: currentUser.value.uid,
          },
        })
        const uploadTask = uploadBytesResumable(
          storageRef(
            getStorage($firebase, 'gs://ptc-sm-finance-uploads'),
            'uploads/' + uid()
          ),
          file,
          {
            customMetadata: {
              ...props.metadata.customMetadata,
              uid: currentUser.value.uid,
            },
          }
        )
        // emit('uploading', { file })
        uploadTask.on('state_changed', {
          next: (snap) => {
            uploading.value = true
            // console.log(snap)
            // loading = true
            // uploadSize = snap.totalBytes
            // uploadedSize = snap.bytesTransferred
            helpers.updateFileStatus(file, 'uploading', snap.bytesTransferred)
            // Size = sp.bytesTransferred
          },
          error: (err) => {
            // console.log(err)
            uploading.value = false
            helpers.updateFileStatus(file, 'failed')
            emit('failed', { file, err })
          },
          complete: (snap) => {
            // console.log('completed')
            // loading = false
            helpers.updateFileStatus(file, 'uploaded')
            emit('uploaded', { file })
            uploading.value = false
          },
        })
      })
    }

    return {
      isUploading,
      // isBusy,
      abort,
      upload,
    }
  },
})
</script>
