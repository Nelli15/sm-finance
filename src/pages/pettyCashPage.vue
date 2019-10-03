<template>
  <q-page padding class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card shadow-0">
      <q-card-section class="text-h6">
        Notes
      </q-card-section>
      <q-separator />
      <q-card-section class="q-gutter-md">
        <q-input prefix="$100 x" :suffix="'$'+(dollars.hundreds * 100).toFixed(2)" color="teal" outlined v-model="dollars.hundreds" type="number" style="max-width:250px" dense>
          <!-- <template v-slot:prepend class="text-h1">
            $100 x
          </template>
          <template v-slot:append>
            = {{ dollars.hundreds * 100 }}
          </template> -->
        </q-input>
        <q-input prefix="$50 x" :suffix="'$'+(dollars.fifties * 50).toFixed(2)" color="teal" outlined v-model="dollars.fifties" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            $50 x
          </template>
          <template v-slot:append>
            = {{ dollars.fifties * 50 }}
          </template> -->
        </q-input>
        <q-input prefix="$20 x" :suffix="'$'+(dollars.twenties * 20).toFixed(2)" color="teal" outlined v-model="dollars.twenties" type="number" style="max-width:250px" dense>
          <!-- <template v-slot:prepend>
            $20 x
          </template>
          <template v-slot:append>
            = {{ dollars.twenties * 20 }}
          </template> -->
        </q-input>
        <q-input prefix="$105 x" :suffix="'$'+(dollars.tens * 10).toFixed(2)" color="teal" outlined v-model="dollars.tens" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            $10 x
          </template>
          <template v-slot:append>
            = {{ dollars.tens * 10 }}
          </template> -->
        </q-input>
        <q-input prefix="$5 x" :suffix="'$'+(dollars.fives * 5).toFixed(2)" color="teal" outlined v-model="dollars.fives" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            $5 x
          </template>
          <template v-slot:append>
            = {{ dollars.fives * 5 }}
          </template> -->
        </q-input>
      </q-card-section>
    </q-card>
    <q-card class="my-card shadow-0">
      <q-card-section class="text-h6">
        Coins
      </q-card-section>
      <q-separator />
      <q-card-section class="q-gutter-md">
        <q-input prefix="$2 x" :suffix="'$'+(dollars.twos * 2).toFixed(2)" color="teal" outlined v-model="dollars.twos" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            $2 x
          </template>
          <template v-slot:append>
            = {{ dollars.twos * 2 }}
          </template> -->
        </q-input>
        <q-input prefix="$1 x" :suffix="'$'+(dollars.ones * 1).toFixed(2)" color="teal" outlined v-model="dollars.ones" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            $1 x
          </template>
          <template v-slot:append>
            = {{ dollars.ones }}
          </template> -->
        </q-input>
        <q-input prefix="50c x" :suffix="'$'+(cents.fifties * 0.50).toFixed(2)" color="teal" outlined v-model="cents.fifties" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            50c x
          </template>
          <template v-slot:append>
            = {{ cents.fifties * 0.5 }}
          </template> -->
        </q-input>
        <q-input prefix="20c x" :suffix="'$'+(cents.twenties * 0.20).toFixed(2)" color="teal" outlined v-model="cents.twenties" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            20c x
          </template>
          <template v-slot:append>
            = {{ cents.twenties * 0.2 }}
          </template> -->
        </q-input>
        <q-input prefix="10c x" :suffix="'$'+(cents.tens * 0.10).toFixed(2)" color="teal" outlined v-model="cents.tens" type="number" style="max-width:250px" dense>
<!--           <template v-slot:prepend>
            10c x
          </template>
          <template v-slot:append>
            = {{ cents.tens * 0.1 }}
          </template> -->
        </q-input>
        <q-input prefix="5c x" :suffix="'$'+(cents.fives * 0.05).toFixed(2)" color="teal" outlined v-model="cents.fives" type="number" style="max-width:250px" dense>
          <!-- <template v-slot:prepend>
            5c x
          </template>
          <template v-slot:append>
            = {{ cents.fives * 0.05 }}
          </template> -->
        </q-input>
      </q-card-section>
    </q-card>
    <q-card class="my-card shadow-0">
      <q-card-section>
        <q-list>
          <q-item>
            <q-item-section class="text-h6">
              Calculated
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-input outlined prefix="Total:" :value="'$'+total" dense>
                <!-- <template v-slot:prepend>
                  Total:
                </template> -->
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input outlined prefix="Expected:" :value="'$'+expected" dense>
                <!-- <template v-slot:prepend>
                  Expected:
                </template> -->
              </q-input>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input outlined prefix="Difference: " :value="'$'+(total - expected).toFixed(2)" dense disabled :rules="[val => Number(val.replace(/[^0-9.-]+/g,'')) > -0.05 || `Petty Cash is missing money`, val => Number(val.replace(/[^0-9.-]+/g,'')) < 0.05 || `Petty Cash has too much money`]">
               <!-- :bg-color="(total - expected) !== 0 ? 'negative' : 'white'" :dark="(total - expected) !== 0"> -->
                <!-- <template v-slot:prepend>
                  Difference:
                </template> -->
              </q-input>
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
