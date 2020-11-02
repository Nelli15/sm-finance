<template>
  <q-btn
    flat
    round
    dense
    icon="import_export"
    @click="$refs.importDialog.show()"
    class="q-ml-md"
  >
    <q-tooltip
      max-width="150px"
      anchor="center right"
      self="center left"
      content-class="bg-cyan-2 text-black"
    >
      Import Budget Categories by CSV
    </q-tooltip>
    <q-dialog ref="importDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label header class="text-h6">
                Import Budget Categories from CSV
              </q-item-label>
              <q-item-label caption>
                Select a CSV to import a list of Budget Categories. Use this
                <q-btn
                  dense
                  flat
                  icon="img:icons/google-spreadsheet.svg"
                  @click="downloadTemplate"
                  size="sm"
                  label="template"
                >
                  <q-tooltip
                    max-width="150px"
                    anchor="center right"
                    self="center left"
                    content-class="bg-cyan-2 text-black"
                  >
                    Download Template
                  </q-tooltip> </q-btn
                >.
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-card-section>
          <q-file
            filled
            v-model="file"
            label="Import CSV"
            accept=".csv"
            @input="
              error = ''
              fileSelected($event)
            "
          >
            <template v-if="file" v-slot:append>
              <q-icon
                name="cancel"
                @click.stop.prevent="
                  file = null
                  error = ''
                "
                class="cursor-pointer"
              />
            </template>
          </q-file>
        </q-card-section>
        <q-card-section class="text-red" v-if="error > ''">
          <q-icon name="error" />
          {{ error }}
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script>
import { mapGetters } from 'vuex'
import firebase from 'firebase/app'
require('firebase/firestore')
import { saveAs } from 'file-saver'

export default {
  name: 'SPCategoryImport',
  data() {
    return {
      file: null,
      error: '',
      expectedTitles: ['label']
    }
  },
  computed: {
    ...mapGetters(['project'])
  },
  methods: {
    async fileSelected() {
      console.log('file selected')
      let csvText = await this.load(this.file)
      console.log(csvText)
      let budgetsObj = this.convertCSVToJSON(csvText)
      this.createBudgets(budgetsObj)
    },
    async load(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = function() {
          resolve(reader.result)
        }
        reader.onerror = function() {
          reject(reader.error)
        }
        reader.readAsText(file)
      })
    },
    convertCSVToJSON(str, delimiter = ',') {
      const titles = str
        .slice(
          0,
          str.indexOf('\r') < str.indexOf('\n')
            ? str.indexOf('\r') !== -1
              ? str.indexOf('\r')
              : str.indexOf('\n')
            : str.indexOf('\n') !== -1
            ? str.indexOf('\n')
            : str.indexOf('\r')
        )
        .split(delimiter)
      for (var title in this.expectedTitles) {
        if (!titles.includes(this.expectedTitles[title])) {
          this.error =
            'Missing Column from Budget Categories CSV "' +
            this.expectedTitles[title] +
            '"'
          return
        }
      }
      const rows = str.slice(str.indexOf('\n') + 1).split('\n')
      return rows.map(row => {
        // Convert to 2D array
        const values = row.split(delimiter)
        // Convert array to object
        return titles.reduce((object, curr, i) => {
          object[curr] = values[i]
          return object
        }, {})
      })
    },
    createBudgets(budgetsObj) {
      let budget = {}
      let uploads = []
      for (var ii in budgetsObj) {
        budget = { type: 'category' }
        for (var jj in this.expectedTitles) {
          budget[this.expectedTitles[jj]] =
            budgetsObj[ii][this.expectedTitles[jj]]
        }
        uploads.push(
          firebase
            .firestore()
            .collection(`projects/${this.project.id}/accounts`)
            .doc()
            .set(budget)
        )
      }
      Promise.all(uploads)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Categories Created Successfully'
          })
          this.$refs.importDialog && this.$refs.importDialog.hide()
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!'
          })
        })
    },
    downloadTemplate() {
      let csv = [this.expectedTitles]
      saveAs(
        new Blob([csv], { type: 'text/plain;charset=utf-8' }),
        `budget-import-template.csv`
      )
    }
  }
}
</script>
