<script>
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
