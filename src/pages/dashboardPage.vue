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
      :rows="projects"
      :columns="columns"
      :rows-per-page-options="[5, 10, 15, 20, 25]"
      row-key="name"
      :grid="grid"
      card-style="height:100vh;"
      v-model:pagination="pagination"
    >
      <template v-slot:top>
        <div class="text-h4">Projects</div>
        <q-space />
        <q-btn
          :icon="!grid ? 'o_view_module' : 'view_headline'"
          @click="grid = !grid"
          dense
        >
          <q-tooltip>
            {{ grid ? 'View List' : 'View Grid' }}
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
          <q-td
            key="number"
            :props="props"
            v-if="props.row.permission === 'admin'"
          >
            {{ props.row.number }}
          </q-td>
          <q-td
            key="participants"
            :props="props"
            v-if="props.row.permission === 'admin'"
          >
            {{ props.row.participants }} Participants
          </q-td>
          <q-td
            key="currency"
            :props="props"
            v-if="props.row.permission === 'admin'"
          >
            Project Currency ({{ props.row.currency }})
          </q-td>
          <q-td key="export" :props="props">
            <q-btn
              icon="view_list"
              label="Open"
              @click="onProjectOpen(props.row.id, props.row.permission)"
            >
              <q-tooltip> Open the Project </q-tooltip>
            </q-btn>
            <q-btn
              icon="import_export"
              label="Export CSV"
              @click.stop="onCSVExport(props.row.id)"
              :loading="exportCSVLoading"
              :disabled="exportCSVLoading"
              v-if="props.row.permission === 'admin'"
            >
              <q-tooltip> Export Transactions in a .csv file </q-tooltip>
            </q-btn>
            <q-btn
              icon="import_export"
              label="Export Receipts"
              @click.stop="onZipExport(props.row.id)"
              :loading="exportZipLoading"
              :disabled="exportZipLoading"
              v-if="props.row.permission === 'admin'"
            >
              <q-tooltip> Export Receipts images in a .zip file </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>
      <template v-slot:item="props">
        <div
          class="
            q-pa-xs
            col-xs-12 col-sm-6 col-md-4 col-lg-3
            grid-style-transition
          "
        >
          <q-card
            class="bg-secondary text-white cursor-pointer"
            @click="onProjectOpen(props.row.id, props.row.permission)"
          >
            <q-card-section>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-h6">{{
                    props.row.name
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side v-if="props.row.permission === 'admin'">
                  <q-item-label class="text-white"
                    >({{ props.row.number }})</q-item-label
                  >
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
                  <q-item-label class="text-white">{{
                    props.row.participants
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section v-if="props.row.permission === 'admin'">
                  <q-item-label>Currency</q-item-label>
                </q-item-section>
                <q-item-section side v-if="props.row.permission === 'admin'">
                  <q-item-label class="text-white">{{
                    props.row.currency
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-separator />
            <q-card-actions align="center" class="bg-secondary text-black">
              <q-btn
                icon="import_export"
                label="Add Transaction"
                style="width: 100%"
                class="bg-white text-black"
                v-if="props.row.permission === 'contributor'"
              >
                <q-tooltip> Export transactions in a .csv file </q-tooltip>
              </q-btn>
              <q-btn
                icon="import_export"
                label="Export CSV"
                @click.stop="onCSVExport(props.row.id)"
                :loading="exportCSVLoading"
                :disabled="exportCSVLoading"
                style="width: 45%"
                class="bg-white text-black"
                v-if="props.row.permission === 'admin'"
              >
                <q-tooltip> Export transactions in a .csv file </q-tooltip>
              </q-btn>
              <q-btn
                icon="import_export"
                label="Export Zip"
                @click.stop="onZipExport(props.row.id)"
                :loading="exportZipLoading"
                :percentage="loading"
                dark-percentage
                style="width: 45%"
                class="bg-white text-black"
                v-if="props.row.permission === 'admin'"
              >
                <q-tooltip> Export receipt images in a .zip file </q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import { saveAs } from 'file-saver'
import JSZip from 'JSZip'

const columns = [
  { name: 'name', align: 'left', label: 'Project', field: 'name' },
  { name: 'number', align: 'center', label: 'Number', field: 'number' },
  { name: 'participants', label: '# Participants', field: 'participants' },
  { name: 'currency', label: 'Currency', field: 'currency' },
  { name: 'export', label: '', field: 'export' },
]

export default {
  data() {
    return {
      columns,
      grid: true,
      exportZipLoading: false,
      exportCSVLoading: false,
      loading: 0,
      // blob: {}
      // project: {
      //   name: 'Gold Coast Schoolies',
      //   id: '12345',
      //   participants: 40,
      //   currency: 'AUD'
      // }
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15,
        // rowsNumber: xx if getting data from a server
      },
    }
  },
  methods: {
    onProjectOpen(projectId, permission) {
      if (permission === 'contributor') {
        this.$router.push(`/project/${projectId}/addTransaction`)
      } else {
        this.$router.push(`/project/${projectId}/summary`)
      }
    },
    async onZipExport(projectId) {
      // this.exportZipLoading = true

      // console.log(projectId, this.idToken)
      if (projectId > '' || true) {
        this.$q.loading.show({
          message: 'Preparing Download',
        })
        this.loading = 0
        // var storageRef = $storage.ref()
        // var projectRef = storageRef
        //   .child('projects')
        //   .child(projectId)
        //   .child('reciepts')
        // const transactions = await firebase.firestore()
        //   .collection(`/projects/${projectId}/transactions`)
        //   .where('receipt', '==', true)
        //   .get()
        // transactions.forEach(async trans => {
        //   const fileName = `${projectId}-${trans.id}.jpg`
        //   const url = await projectRef.child(fileName).getDownloadURL()
        //   console.log(url)
        // })
        const src = `/downloadReceiptsZip/?projectId=${projectId}`
        const options = {
          headers: {
            Authorization: `Bearer ${this.idToken}`,
          },
        }
        let res = await fetch(src, options).catch(() => {
          console.log('error occured')
          this.exportZipLoading = false
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
        // console.log(res.status, res)
        let links = await res.json()
        let zip = new JSZip()
        let counter = 0
        for (var link in links) {
          counter++
          this.loading = ((counter / Object.keys(links).length) * 100).toFixed(
            2
          )
          this.$q.loading.show({
            message: `Downloading Receipts: ${counter} of ${
              Object.keys(links).length
            } - ${this.loading}%`,
            delay: 0,
          })
          // console.log('Getting Images: ' + this.loading + '%')
          const res = await fetch(links[link][0], {
            // mode: 'no-cors',
            // headers: { 'Access-Control-Allow-Origin': '*' },
            // credentials: 'omit'
          })
          // console.log(await res.blob())
          zip.file(link, await res.blob())
        }
        this.$q.loading.show({
          message:
            'Zipping everything up, depending on the number of receipts this may take a few minutes. Do not leave this page or refresh',
          delay: 0,
        })
        // console.log('Getting Images: ' + this.loading + '%')

        const blob = await zip.generateAsync(
          {
            type: 'blob',
          },
          (metadata) => {
            this.$q.loading.show({
              message: `Zipping File: ${
                metadata.currentFile
              } - ${metadata.percent}% `,
              delay: 0,
            })
          }
        )
        this.$q.loading.show({
          message: 'Saving File',
          delay: 0,
        })
        // console.log(this.projects.find)
        saveAs(
          blob,
          `${this.projects.find((val) => val.id === projectId).number}-${
            this.projects.find((val) => val.id === projectId).name
          }.zip`
        )
        this.exportZipLoading = false
        this.$q.loading.hide()
        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'cloud_download',
          message: '.zip Export Successful',
        })
      }
      this.$q.loading.hide()
    },
    async onCSVExport(projectId) {
      this.exportCSVLoading = true
      // console.log(projectId, this.idToken)
      if (projectId > '') {
        const src = `/downloadCSV/?projectId=${projectId}`
        const options = {
          headers: {
            Authorization: `Bearer ${this.idToken}`,
          },
        }
        let res = await fetch(src, options).catch(() => {
          console.log('error occured')
          this.exportCSVLoading = false
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
        // console.log(res.status)
        let blob = await res.blob()
        // console.log(blob)
        saveAs(
          blob,
          `${this.projects.find((val) => val.id === projectId).number}-${
            this.projects.find((val) => val.id === projectId).name
          }.csv`
        )
        this.exportCSVLoading = false
        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'cloud_download',
          message: '.CSV Export Successful',
        })
      }
    },
  },
  computed: {
    ...mapGetters('projects', ['projects']),
    ...mapGetters('auth', ['idToken']),
  },
}
</script>
