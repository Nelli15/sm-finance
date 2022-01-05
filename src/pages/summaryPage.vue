<template>
  <q-page>
    <q-banner class="bg-secondary text-white text-center" rounded>
      <q-badge class="bg-secondary text-h4">
        {{ project.name }}
        <q-popup-edit v-model="project.name">
          <q-input
            :model-value="project.name > '' ? project.name : ''"
            @update:model-value="updateProject('name', $event)"
            dense
            autofocus
            label="Project Label"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-subtitle1 q-mb-sm">
        {{ project.number > '' ? project.number : 'Project Code' }}
        <q-popup-edit v-model="project.number" max-width="100px">
          <q-input
            :model-value="project.number > '' ? project.number : ''"
            @update:model-value="updateProject('number', $event)"
            dense
            autofocus
            label="Project Number"
            input-style="max-width:100px;"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-h6">
        {{ project.participants }} Participants
        <q-popup-edit v-model="project.participants">
          <q-input
            :model-value="project.participants > '' ? project.participants : ''"
            @update:model-value="updateProject('participants', $event)"
            dense
            autofocus
            label="Participants"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <br />
      <q-badge class="bg-secondary text-subtitle-1">
        Project Currency ({{ project.currency }})
        <q-popup-edit v-model="project.currency">
          <q-input
            :model-value="project.currency > '' ? project.currency : ''"
            @update:model-value="updateProject('currency', $event)"
            dense
            label="Currency"
          />
        </q-popup-edit>
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          class="bg-accent text-black"
        >
          <q-icon name="edit" />Edit
        </q-tooltip>
      </q-badge>
      <q-select
        :model-value="
          project.contributorTransTypeOpts
            ? project.contributorTransTypeOpts
            : []
        "
        @update:model-value="
          ($event) => {
            project.contributorTransTypeOpts = $event
            updateProject('contributorTransTypeOpts', $event)
          }
        "
        dense
        borderless
        label="Contributor Transaction Types"
        multiple
        :options="['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']"
        style="width: 250px"
        class="q-mx-auto"
        label-color="white"
        hide-dropdown-icon
      >
        <template v-slot:selected-item="scope">
          <q-chip
            dense
            :tabindex="scope.tabindex"
            text-color="white"
            class="q-ma-none"
            style="background-color: inherit"
          >
            {{ scope.opt }}
          </q-chip>
        </template>
      </q-select>
    </q-banner>
    <accountsTable />
    <categoriesTable />
   <actionsStickyFAB />
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { debounce } from 'quasar'
import { defineAsyncComponent } from 'vue'

export default {
  data() {
    return {
    }
  },
  created() {
    this.updateProject = debounce(this.updateProject, 3000)
  },
  methods: {
    ...mapActions('projects', ['updateProjectByKey']),
    updateProject(key, val) {
      this.updateProjectByKey({ projectId: this.project.id, key, val })
      updateProjectByKey(this.project.id, key, val)
        .then(() => {
          // console.log('updated')
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'Project: Updated Successfully',
          })
        })
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'error',
            message: 'Oops, Something went wrong!',
          })
        })
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
  },
  components: {
    actionsStickyFAB: defineAsyncComponent(() =>
      import('./../components/actionsStickyFAB.vue')
    ),
    'accountsTable': defineAsyncComponent(() =>
      import('../components/accountsTable.vue')
    ),
    'categoriesTable': defineAsyncComponent(() =>
      import('../components/categoriesTable.vue')
    ),
  },
}
</script>
