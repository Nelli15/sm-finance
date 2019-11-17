<template>
  <q-page padding>
    <!-- DASHBOARD -->
    <!-- {{ projects }} -->
   <!--  <q-banner class="bg-secondary text-white text-center" rounded v-for="project in projects" :key="project.id" style="max-width:250px">
      <div class="text-h4">{{ project.name }}</div>
      <div class="text-subtitle1  q-pb-md">{{ project.number }}</div>
      <div class="text-h6">{{ project.participants }} Participants</div>
      <div class="text-subtitle-1">Project Currency ({{ project.currency }})</div>
    </q-banner> -->
    <q-table
      :data="projects"
      :columns="columns"
      :rows-per-page-options="[5]"
      row-key="name"
      :grid="grid"
      card-style="height:100vh;"
    >
      <template v-slot:top>
        <div class="text-h4"> Projects </div>
        <q-space />
        <q-btn :icon="!grid?'o_view_module':'view_headline'" @click="grid = !grid" dense>
          <q-tooltip>
            {{grid?'View List':'View Grid'}}
          </q-tooltip>
        </q-btn>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props" class="text-h6">
            {{ props.row.name }}
            <!-- <q-popup-edit v-model="props.row.category">
              <q-input v-model="props.row.category" dense autofocus counter label="Budget Category" />
            </q-popup-edit> -->
          </q-td>
          <q-td key="number" :props="props" v-if="props.row.permission === 'admin'">
            {{ props.row.number }}
          </q-td>
          <q-td key="participants" :props="props" v-if="props.row.permission === 'admin'">
            {{ props.row.participants }} Participants
          </q-td>
          <q-td key="currency" :props="props" v-if="props.row.permission === 'admin'">
            Project Currency ({{ props.row.currency }})
          </q-td>
          <q-td key="export" :props="props">
            <q-btn icon="view_list" label="Open" @click="onProjectOpen(props.row.id, props.row.permission)">
              <q-tooltip>
                Open the Project
              </q-tooltip>
            </q-btn>
            <q-btn icon="import_export" label="Export CSV" @click.stop="onCSVExport(props.row.id)" :loading="exportCSVLoading" :disabled="exportCSVLoading" v-if="props.row.permission === 'admin'">
              <q-tooltip>
                Export Transactions in a .csv file
              </q-tooltip>
            </q-btn>
            <q-btn icon="import_export" label="Export Receipts" @click.stop="onZipExport(props.row.id)" :loading="exportZipLoading" :disabled="exportZipLoading" v-if="props.row.permission === 'admin'">
              <q-tooltip>
                Export Receipts images in a .zip file
              </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
          <q-card class="bg-secondary text-white cursor-pointer" @click="onProjectOpen(props.row.id, props.row.permission)">
            <q-card-section>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-h6">{{ props.row.name }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="props.row.permission === 'admin'">
                  <q-item-label class="text-white">({{ props.row.number }})</q-item-label>
                </q-item-section>
              </q-item>
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item>
                <q-item-section v-if="props.row.permission === 'admin'">
                  <q-item-label>Participants </q-item-label>
                </q-item-section>
                <q-item-section side v-if="props.row.permission === 'admin'">
                  <q-item-label class="text-white">{{ props.row.participants }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section v-if="props.row.permission === 'admin'">
                  <q-item-label>Currency</q-item-label>
                </q-item-section>
                <q-item-section side v-if="props.row.permission === 'admin'">
                  <q-item-label class="text-white">{{ props.row.currency }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-separator />
            <q-card-actions align="center" class="bg-secondary text-black" v-if="props.row.permission === 'contributor'">
              <q-btn icon="import_export" label="Add Transaction" style="width:100%" class="bg-white text-black">
                <q-tooltip>
                  Export transactions in a .csv file
                </q-tooltip>
              </q-btn>
              <q-btn icon="import_export" label="Export CSV" @click.stop="onCSVExport(props.row.id)" :loading="exportCSVLoading" :disabled="exportCSVLoading" style="width:45%" class="bg-white text-black">
                <q-tooltip>
                  Export transactions in a .csv file
                </q-tooltip>
              </q-btn>
              <q-btn icon="import_export" label="Export Zip" @click.stop="onZipExport(props.row.id)" :loading="exportZipLoading" :disabled="exportZipLoading" style="width:45%" class="bg-white text-black">
                <q-tooltip>
                  Export receipt images in a .zip file
                </q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// import firebase from 'firebase/app'
// require('firebase/firestore')
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'

const columns = [
  { name: 'name', align: 'left', label: 'Project', field: 'name' },
  { name: 'number', align: 'center', label: 'Number', field: 'number' },
  { name: 'participants', label: '# Participants', field: 'participants' },
  { name: 'currency', label: 'Currency', field: 'currency' },
  { name: 'export', label: '', field: 'export' }
]

export default {
  data () {
    return {
      columns,
      grid: true,
      exportZipLoading: false,
      exportCSVLoading: false
      // project: {
      //   name: 'Gold Coast Schoolies',
      //   id: '12345',
      //   participants: 40,
      //   currency: 'AUD'
      // }
    }
  },
  created () {
    // this.$store.dispatch('fetchProjects', this.$route.params.id)
  },
  methods: {
    onProjectOpen (projectId, permission) {
      if (permission === 'contributor') {
        this.$router.push(`/project/${projectId}/addTransaction`)
      } else {
        this.$router.push(`/project/${projectId}/summary`)
      }
    },
    async onZipExport (projectId) {
      this.exportZipLoading = true
      // console.log(projectId, this.idToken)
      if (projectId > '') {
        const src = `/downloadReceiptsZip/?projectId=${projectId}`
        const options = {
          headers: {
            Authorization: `Bearer ${this.idToken}`
          }
        }
        let res = await fetch(src, options)
          .catch(() => {
            console.log('error occured')
            this.exportZipLoading = false
            this.$q.notify({
              color: 'negative',
              textColor: 'white',
              icon: 'error',
              message: 'Oops, Something went wrong!'
            })
          })
        console.log(res.status)
        let blob = await res.blob()
        // console.log(blob)
        saveAs(blob, 'receipts.zip')
        this.exportZipLoading = false
        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'cloud_download',
          message: '.zip Export Successful'
        })
      }
    },
    async onCSVExport (projectId) {
      this.exportCSVLoading = true
      // console.log(projectId, this.idToken)
      if (projectId > '') {
        const src = `/downloadCSV/?projectId=${projectId}`
        const options = {
          headers: {
            Authorization: `Bearer ${this.idToken}`
          }
        }
        let res = await fetch(src, options)
          .catch(() => {
            console.log('error occured')
            this.exportCSVLoading = false
            this.$q.notify({
              color: 'negative',
              textColor: 'white',
              icon: 'error',
              message: 'Oops, Something went wrong!'
            })
          })
        console.log(res.status)
        let blob = await res.blob()
        // console.log(blob)
        saveAs(blob, 'transactions.csv')
        this.exportCSVLoading = false
        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'cloud_download',
          message: '.CSV Export Successful'
        })
      }
    }
  },
  computed: {
    ...mapGetters([
      'projects',
      'idToken'
    ])
  }
}
</script>
