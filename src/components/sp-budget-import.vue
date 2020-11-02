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
      Import Budgets by CSV
    </q-tooltip>
    <q-dialog ref="importDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label header class="text-h6">
                Import Budgets from CSV
              </q-item-label>
              <q-item-label caption>
                Select a CSV to import a list of Budgets. Use this
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
                  </q-tooltip>
                </q-btn>
                and ensure the categories match the category labels aleady
                created.
              </q-item-label>
            </q-item-section>
            <q-item-section side v-if="false">
              <q-btn
                dense
                flat
                icon="img:icons/google-spreadsheet.svg"
                @click="downloadTemplate"
              >
                <q-tooltip
                  max-width="150px"
                  anchor="center right"
                  self="center left"
                  content-class="bg-cyan-2 text-black"
                >
                  Download Template
                </q-tooltip>
              </q-btn>
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
  name: 'SPBudgetImport',
  data() {
    return {
      file: null,
      error: '',
      expectedTitles: ['label', 'category', 'amount']
    }
  },
  computed: {
    ...mapGetters(['project', 'budgetCategories'])
  },
  methods: {
    async fileSelected() {
      let csvText = await this.load(this.file)
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
    convertCSVToJSON(str) {
      // console.log(JSON.stringify(str))
      str = str.replace('\r\n', '\n').replace('\n\r', '\n')

      const titles = str
        .slice(0, str.indexOf('\n'))
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      for (var title in this.expectedTitles) {
        if (!titles.includes(this.expectedTitles[title])) {
          this.error =
            'Missing Column from Budget CSV "' +
            this.expectedTitles[title] +
            '"'
          return
        }
      }
      const rows = str.slice(str.indexOf('\n') + 1).split('\n')
      return rows.map(row => {
        // Convert to 2D array
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
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
        // console.log(budgetsObj[ii])
        budget = { type: 'budget' }
        let errorFound = false
        for (var jj in this.expectedTitles) {
          if (this.expectedTitles[jj] === 'category') {
            let budgetCategory = Object.values(this.budgetCategories).find(
              item => {
                return (
                  item.label
                    .toLowerCase()
                    .replace('\r', '')
                    .replace('\n', '') ===
                  budgetsObj[ii][this.expectedTitles[jj]]
                    .toLowerCase()
                    .replace('\r', '')
                    .replace('\n', '')
                )
              }
            )
            if (!budgetCategory) {
              // console.log(
              //   'error found, no budget category',
              //   budgetCategory,
              //   budgetsObj[ii][this.expectedTitles[jj]]
              // )
              errorFound = true
              break
            }

            budget[this.expectedTitles[jj]] = budgetCategory.id
          } else if (this.expectedTitles[jj] === 'amount') {
            budget.budget = Number(
              typeof budgetsObj[ii][this.expectedTitles[jj]] === 'number'
                ? budgetsObj[ii][this.expectedTitles[jj]]
                : budgetsObj[ii][this.expectedTitles[jj]] !== undefined
                ? budgetsObj[ii][this.expectedTitles[jj]].replace(
                    /[^0-9.-]+/g,
                    ''
                  )
                : 0
            )
          } else {
            budget[this.expectedTitles[jj]] =
              budgetsObj[ii][this.expectedTitles[jj]]
          }
        }
        if (errorFound === true) continue
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
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Budgets: Created Successfully'
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
