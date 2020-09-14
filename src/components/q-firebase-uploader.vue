<!-- <script>
import { QUploaderBase, uid } from 'quasar'
import firebase from 'firebase/app'
import 'firebase/storage'
// import uid from 'uuidv4'
export default {
  mixins: [ QUploaderBase ],
  props: {
    metadata: Object
  },
  data () {
    return {
      progressUpload: 0,
      file: File,
      uploadTask: ''
      // loading: false
    }
  },
  methods: {
    upload () {
      this.files.forEach(file => {
        const ref = 'uploads/' + uid()
        // var meta = file.metadata
        // meta.customMetadata = this.metadata
        const uploadTask = firebase
          .storage()
          .ref()
          .child(ref)
          .put(file, this.metadata)
        uploadTask.on(
          'state_changed',
          sp => {
            // this.loading = true
            this.uploadSize = sp.totalBytes
            this.uploadedSize = sp.bytesTransferred
            // this.Size = sp.bytesTransferred
          },
          null,
          () => {
            // this.loading = false
            uploadTask.snapshot.ref.then(downloadURL => {
              this.$emit('upload', {
                // url: downloadURL,
                id: ref,
                name: file.name,
                size: file.size,
                uploadedDate: new Date(),
                lastModified: file.lastModified,
                description: ''
              })
              this.removeFile(file)
            })
          }
        )
      })
    }
  }
}
</script>
 -->

<script>
import { QUploaderBase, uid } from 'quasar'
import firebase from 'firebase/app'
import 'firebase/storage'
// import uid from 'uuidv4'
export default {
  name: 'q-firebase-uploader',
  mixins: [QUploaderBase],
  props: {
    metadata: Object
  },
  data() {
    return {}
  },
  methods: {
    // [REQUIRED]
    // abort and clean up any process
    // that is in progress
    abort() {
      // ...
    },

    // [REQUIRED]
    upload() {
      if (this.canUpload === false) {
        return
      }
      this.$emit('start')
      this.isBusy = true
      this.files.forEach(file => {
        const ref = 'uploads/' + uid()
        // var meta = file.metadata
        // meta.customMetadata = this.metadata
        const uploadTask = firebase
          .storage()
          .refFromURL('gs://sp-finance-uploads')
          .child(ref)
          .put(file, this.metadata)
        this.$emit('uploading', { file })
        uploadTask.on('state_changed', {
          next: snap => {
            this.isUploading = true
            // console.log(snap)
            // this.loading = true
            this.uploadSize = snap.totalBytes
            this.uploadedSize = snap.bytesTransferred
            this.__updateFile(file, 'uploading', snap.bytesTransferred)
            // this.Size = sp.bytesTransferred
          },
          error: err => {
            // console.log(err)
            this.$emit('failed', { file, err })
          },
          complete: () => {
            // console.log('completed')
            // this.loading = false
            this.__updateFile(file, 'uploaded')
          }
        })

        uploadTask.then(snap => {
          console.log(snap)
          this.$emit('uploaded', { file, metadata: snap.metadata })
          this.isUploading = false
          this.isBusy = false
          // this.$emit('upload', {
          //   // url: downloadURL,
          //   id: ref,
          //   name: file.name,
          //   size: file.size,
          //   uploadedDate: new Date(),
          //   lastModified: file.lastModified,
          //   description: ''
          // })
          // this.removeFile(file)
        })
      })
    }
  }
}
</script>
