<script setup>
  import { computed, ref, watch } from 'vue'
  import { TrainingEntryRules } from '@/domain/trainingEntryRules'
  import { Switch } from '@/components/ui/switch'
  import { dayjs } from '@/shared/dayjs'

  const props = defineProps({
    state: { type: Object, required: true },
    entries: { type: Array, required: true },
  })

  const emit = defineEmits(['update:state', 'add'])

  const BAR_OPTIONS = Object.freeze([10, 20])
  const SIDE_OPTIONS = Object.freeze([1.25, 2.5, 5, 10, 15, 20])

  const errors = ref([])
  const selectedBar = ref([])
  const selectedSide = ref([])

  const update = (key, value) => {
    emit('update:state', { ...props.state, [key]: value })
  }

  const updateUi = (key, value) => {
    emit('update:state', {
      ...props.state,
      ui: { ...(props.state.ui ?? {}), [key]: value },
    })
  }

  const sum = (arr) => arr.reduce((acc, v) => acc + Number(v), 0)

  const barWeight = computed(() => sum(selectedBar.value))
  const sideWeight = computed(() => sum(selectedSide.value))
  const totalWeight = computed(() => barWeight.value + sideWeight.value * 2)

  watch(
    () => [barWeight.value, sideWeight.value],
    () => {
      emit('update:state', {
        ...props.state,
        bar: barWeight.value,
        side: sideWeight.value,
        weight: totalWeight.value,
      })
    },
    { immediate: true }
  )

  const draft = computed(() => TrainingEntryRules.fromState(props.state))

  const validate = () => {
    errors.value = TrainingEntryRules.validate(draft.value)
    return errors.value.length === 0
  }

  const add = () => {
    if (!validate()) return
    emit('add')
  }

  const muscleGroupOptions = computed(() => {
    const set = new Set(
      props.entries.map((x) => (x.muscleGroup || '').trim()).filter(Boolean)
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  })

  const workoutNameOptions = computed(() => {
    const set = new Set(
      props.entries.map((x) => (x.workoutName || '').trim()).filter(Boolean)
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'))
  })

  const nextTrainingNo = computed(() => {
    const max = props.entries.reduce(
      (m, x) => Math.max(m, Number(x.trainingNo || 0)),
      0
    )
    return max + 1
  })

  const MSK_TZ = 'Europe/Moscow'
  const ISO_WITH_OFFSET = 'YYYY-MM-DD[T]HH:mm:ssZ'
  const INPUT_FORMAT = 'YYYY-MM-DD[T]HH:mm'

  const nowMskIso = () => dayjs().tz(MSK_TZ).format(ISO_WITH_OFFSET)

  const toDateTimeInput = (iso) => {
    if (!iso) return ''
    const d = dayjs(iso)
    if (!d.isValid()) return ''
    return d.tz(MSK_TZ).format(INPUT_FORMAT)
  }

  const fromDateTimeInput = (value) => {
    if (!value) return null
    const d = dayjs.tz(value, INPUT_FORMAT, MSK_TZ)
    if (!d.isValid()) return null
    return d.format(ISO_WITH_OFFSET)
  }

  watch(
    () => props.entries.length,
    () => {
      if (!props.state.trainingNo) update('trainingNo', nextTrainingNo.value)
      if (!props.state.trainingDateIso) update('trainingDateIso', nowMskIso())
    },
    { immediate: true }
  )

  watch(
    () => props.state,
    (s) => {
      const isHardReset =
        !s?.trainingNo &&
        !String(s?.muscleGroup || '').trim() &&
        !String(s?.workoutName || '').trim() &&
        !s?.trainingDateIso &&
        !s?.bar &&
        !s?.side &&
        !s?.weight

      if (isHardReset) {
        selectedBar.value = []
        selectedSide.value = []
        errors.value = []
      }
    },
    { deep: true }
  )
</script>

<template>
  <section class="block">
    <header class="top">
      <h2 class="title">Добавление тренировки</h2>
      <button class="btn primary" type="button" @click="add"> Добавить </button>
    </header>

    <div class="grid">
      <label class="field">
        <span>Номер</span>
        <input
          :value="state.trainingNo ?? nextTrainingNo"
          type="number"
          min="1"
          step="1"
          @input="update('trainingNo', Number($event.target.value))"
        />
      </label>

      <label class="field">
        <span>Дата и время (МСК)</span>
        <input
          :value="toDateTimeInput(state.trainingDateIso)"
          type="datetime-local"
          step="60"
          @input="
            update('trainingDateIso', fromDateTimeInput($event.target.value))
          "
        />
      </label>

      <label class="field">
        <span>Повторения</span>
        <input
          :value="state.reps"
          type="number"
          min="1"
          step="1"
          @input="update('reps', Number($event.target.value))"
        />
      </label>

      <label class="field">
        <span>Группа мышц</span>
        <input
          :value="state.muscleGroup"
          type="text"
          list="muscle-groups"
          @input="update('muscleGroup', $event.target.value)"
        />
        <datalist id="muscle-groups">
          <option v-for="m in muscleGroupOptions" :key="m" :value="m" />
        </datalist>
      </label>

      <label class="field">
        <span>Упражнение</span>
        <input
          :value="state.workoutName"
          type="text"
          list="workouts"
          @input="update('workoutName', $event.target.value)"
        />
        <datalist id="workouts">
          <option v-for="w in workoutNameOptions" :key="w" :value="w" />
        </datalist>
      </label>

      <label class="field">
        <span>Заметка</span>
        <input
          :value="state.note"
          type="text"
          @input="update('note', $event.target.value)"
        />
      </label>

      <div class="field full">
        <span class="legend">Штанга</span>
        <div class="checks">
          <label v-for="w in BAR_OPTIONS" :key="w" class="check">
            <input type="checkbox" :value="w" v-model="selectedBar" />
            <span>{{ w }} кг</span>
          </label>
        </div>
      </div>

      <div class="field full">
        <span class="legend">Диски на одну сторону</span>
        <div class="checks">
          <label v-for="w in SIDE_OPTIONS" :key="w" class="check">
            <input type="checkbox" :value="w" v-model="selectedSide" />
            <span>{{ w }} кг</span>
          </label>
        </div>
      </div>

      <div class="field full summary">
        <div class="row">
          <span>Штанга</span>
          <span class="mono">{{ barWeight }} кг</span>
        </div>
        <div class="row">
          <span>Одна сторона</span>
          <span class="mono">{{ sideWeight }} кг</span>
        </div>
        <div class="row total">
          <span>Итого</span>
          <span class="mono">{{ totalWeight }} кг</span>
        </div>
      </div>

      <div class="field full rowLine">
        <span>Подсказки</span>
        <Switch
          :checked="state.ui?.showHelp ?? true"
          @update:checked="updateUi('showHelp', $event)"
        />
      </div>
    </div>

    <div v-if="errors.length" class="errors">
      <div v-for="e in errors" :key="e" class="error">
        {{ e }}
      </div>
    </div>
  </section>
</template>
