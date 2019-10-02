<template>
  <q-page padding class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card">
      <q-card-section>
        Notes
      </q-card-section>
      <q-card-section>
        <q-input color="teal" outlined v-model="dollars.hundreds" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $100 x
          </template>
          <template v-slot:append>
            = {{ dollars.hundreds * 100 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="dollars.fifties" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $50 x
          </template>
          <template v-slot:append>
            = {{ dollars.fifties * 50 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="dollars.twenties" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $20 x
          </template>
          <template v-slot:append>
            = {{ dollars.twenties * 20 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="dollars.tens" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $10 x
          </template>
          <template v-slot:append>
            = {{ dollars.tens * 10 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="dollars.fives" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $5 x
          </template>
          <template v-slot:append>
            = {{ dollars.fives * 5 }}
          </template>
        </q-input>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <q-card-section>
        Coins
      </q-card-section>
      <q-card-section>
        <q-input color="teal" outlined v-model="dollars.twos" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $2 x
          </template>
          <template v-slot:append>
            = {{ dollars.twos * 2 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="dollars.ones" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            $1 x
          </template>
          <template v-slot:append>
            = {{ dollars.ones }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="cents.fifties" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            50c x
          </template>
          <template v-slot:append>
            = {{ cents.fifties * 0.5 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="cents.twenties" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            20c x
          </template>
          <template v-slot:append>
            = {{ cents.twenties * 0.2 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="cents.tens" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            10c x
          </template>
          <template v-slot:append>
            = {{ cents.tens * 0.1 }}
          </template>
        </q-input>
        <q-input color="teal" outlined v-model="cents.fives" type="number" style="max-width:250px" dense>
          <template v-slot:prepend>
            5c x
          </template>
          <template v-slot:append>
            = {{ cents.fives * 0.05 }}
          </template>
        </q-input>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section>
              Total: {{ total }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              Expected: {{ expected }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section :style="'color:'+((total - expected) !== 0 ? 'red' : 'black')">
              Difference: {{ total - expected }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
  data () {
    return {
      dollars: {
        hundreds: 0,
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0,
        twos: 0,
        ones: 0
      },
      cents: {
        fifties: 0,
        twenties: 0,
        tens: 0,
        fives: 0
      },
      expected: 1000
    }
  },
  created () {
    // this.$store.dispatch('',this.$route.params.id)
  },
  computed: {
    total () {
      return (this.dollars.hundreds * 100 + this.dollars.fifties * 50 + this.dollars.twenties * 20 + this.dollars.tens * 10 + this.dollars.fives * 5 + this.dollars.twos * 2 + this.dollars.ones * 1 + this.cents.fifties * 0.5 + this.cents.twenties * 0.2 + this.cents.tens * 0.1 + this.cents.fives * 0.05).toFixed(2)
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 31%
  height: 310px
</style>
