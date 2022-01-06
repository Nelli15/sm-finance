<template>
  <q-input
    ref="inputRef"
    v-model="value"
    :error-message="errorMessage"
    :error="!!errorMessage"
    prefix="$"
    hint="$#,###.##"
    dense
    :label="label"
    :rules="rules"
  />
</template>

<script>
import { parse, useCurrencyInput } from 'vue-currency-input'
import { useField } from 'vee-validate'

export default {
  name: 'QCurrencyInput',
  props: {
    modelValue: Number,
    options: Object,
    label: String,
    rules: Array,
  },
  setup(props) {
    const { inputRef } = useCurrencyInput(props.options)
    const validateMinValue = (value) => {
      if (parse(value, props.options) < 0.0) {
        return 'Minimum Value is $0.00'
      } else {
        return true
      }
    }
    const { errorMessage, value } = useField('amount', validateMinValue)

    return { inputRef, errorMessage, value }
  },
}
</script>
<!--<template>
  <q-field prefix="$" hint="$#,###.##" dense :label="label" :rules="rules">
    <input ref="inputRef" type="text" />
  </q-field>
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input'

export default {
  name: 'CurrencyInput',
  props: {
    modelValue: Number, // Vue 2: value
    options: Object,
    label: String,
    rules: Array,
  },
  setup(props) {
    const { inputRef } = useCurrencyInput(props.options)

    return { inputRef }
  },
}
</script>
-->
<!--<template>
  <q-input
    outlined
    ref="input"
    v-currency="options"
    :value="formattedValue"
    @input="onInput"
    @onChange="onChange"
  />
</template>

<script>
import { CurrencyDirective, setValue, getValue } from 'vue-currency-input'

export default {
  name: 'QCurrencyInput',
  props: {
    value: {
      type: Number,
      default: null,
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  directives: {
    currency: CurrencyDirective,
  },
  data() {
    return {
      formattedValue: null,
    }
  },
  watch: {
    value(value) {
      this.setValue(value)
    },
  },
  mounted() {
    this.setValue(this.value)
  },
  methods: {
    setValue(value) {
      setValue(this.$refs.input, value)
    },
    onInput(value) {
      this.$emit('input', getValue(this.$refs.input))
      this.formattedValue = value
    },
    onChange(value) {
      this.$emit('change', getValue(this.$refs.input))
      this.formattedValue = value
    },
  },
}
</script> -->
