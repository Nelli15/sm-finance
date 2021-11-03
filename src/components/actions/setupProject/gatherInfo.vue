<template>
  <div>
    To get started we need a few details from you.
    <q-item class="justify-center">
      <ul>
        <li>Label - The name of the Summer Project</li>
        <li>
          Project Code - A unique code for the Project *Year**Letter* Example:
          2021G for Gold Coast Schoolies in 2021
        </li>
        <li>
          Number of Participants - The number of participants on the project.
        </li>
        <li>
          Project Currency - The primary currency that the project operates
          with.
        </li>
        <li>
          Contributor Transaction Type - The Transaction types that the
          contributors have access to. Select at least one!
        </li>
      </ul>
    </q-item>
    <q-form>
      <q-list>
        <q-item>
          <q-input
            v-model="info.name"
            label="Project Label"
            class="full-width"
            type="text"
          />
        </q-item>
        <q-item>
          <q-input
            v-model="info.number"
            label="Project Code"
            class="full-width"
            type="text"
          />
        </q-item>
        <q-item>
          <q-input
            v-model="info.participants"
            label="Number of Participants"
            class="full-width"
            type="number"
          />
        </q-item>
        <q-item>
          <q-input
            v-model="info.currency"
            label="Project Currency"
            class="full-width"
            type="text"
          />
        </q-item>
        <q-item>
          <q-select
            v-model="info.contributorTransTypeOpts"
            label="Contributor Transaction Types"
            multiple
            :options="['Cash', 'Internet Transfer', 'Cheque', 'Bank Card']"
            class="full-width"
          >
            <template v-slot:selected-item="scope">
              <q-chip
                dense
                :tabindex="scope.tabindex"
                text-color="white"
                color="primary"
              >
                {{ scope.opt }}
              </q-chip>
            </template>
          </q-select>
        </q-item>
      </q-list>
    </q-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateProject } from './../../../scripts/project.js'
export default {
  name: 'gatherInfo',
  data() {
    return {
      state: false,
      info: {
        name: '',
        number: '',
        participants: 0,
        currency: 'AUD',
        contributorTransTypeOpts: ['Cash'],
      },
    }
  },
  created() {
    this.info = JSON.parse(JSON.stringify(this.project))
  },
  methods: {
    cancel() {
      return (this.info = JSON.parse(JSON.stringify(this.project)))
    },
    async save() {
      // console.log(this.info)
      if (
        this.info.name > '' &&
        this.info.number > '' &&
        this.info.participants > 0 &&
        this.info.currency > '' &&
        this.info.contributorTransTypeOpts &&
        this.info.contributorTransTypeOpts.length > 0
      ) {
        return await updateProject(this.$route.params.id, this.info).then(
          (res) => true
        )
      } else {
        return false
      }
    },
  },
  computed: {
    ...mapGetters('projects', ['project']),
  },
}
</script>
