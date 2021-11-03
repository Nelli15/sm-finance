<script>
import { createUploaderComponent } from 'quasar'
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { $firebase } from './../scripts/firebase.js'
import { computed } from 'vue'
import { v4 as uid } from 'uuid'

export default createUploaderComponent({
  name: 'q-firebase-uploader',
  props: {
    metadata: Object,
  },
  emits: ['start', 'uploading', 'uploaded', 'failed'],
  injectPlugin({ props, emit, helpers }) {
    // console.log(helpers)

    let uploading = ref(false)
    const isUploading = computed(() => {
      return uploading.value
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
        const uploadTask = uploadBytesResumable(
          ref(
            getStorage($firebase, 'gs://sp-finance-uploads'),
            'uploads/' + uid()
          ),
          file,
          props.metadata
        )
        emit('uploading', { file })
        uploadTask.on('state_changed', {
          next: (snap) => {
            uploading = true
            // console.log(snap)
            // loading = true
            // uploadSize = snap.totalBytes
            // uploadedSize = snap.bytesTransferred
            helpers.updateFileStatus(file, 'uploading', snap.bytesTransferred)
            // Size = sp.bytesTransferred
          },
          error: (err) => {
            // console.log(err)
            uploading = false
            helpers.updateFileStatus(file, 'failed')
            emit('failed', { file, err })
          },
          complete: (snap) => {
            // console.log('completed')
            // loading = false
            helpers.updateFileStatus(file, 'uploaded')
            emit('uploaded', { file })
            uploading = false
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
