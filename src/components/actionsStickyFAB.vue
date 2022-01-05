<template>
   <q-page-sticky position="bottom-left" :offset="fabPos" style="z-index: 100">
      <q-btn
        fab
        icon="add_task"
        color="primary"
        direction="up"
        :disable="draggingFab"
        v-touch-pan.prevent.mouse="moveFab"
      >
        <q-tooltip class="bg-accent text-black"> Add Actions </q-tooltip>
        <q-menu persistent>
          <actionsMenu />
        </q-menu>
      </q-btn>
    </q-page-sticky>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  data() {
    return {
      fabPos: [18, 18],
      draggingFab: false,
    }
  },
  methods: {
    moveFab(ev) {
      this.draggingFab = ev.isFirst !== true && ev.isFinal !== true

      this.fabPos = [this.fabPos[0] + ev.delta.x, this.fabPos[1] - ev.delta.y]
    },
  },
  components: {
    actionsMenu: defineAsyncComponent(() =>
      import('./../components/actionsMenu.vue')
    ),
  },
}
</script>
