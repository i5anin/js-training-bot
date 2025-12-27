<script setup>
import { computed, ref, watch } from 'vue'
import { TrainingEntryRules } from '@/domain/trainingEntryRules'

const props = defineProps({
  state: { type: Object, required: true }
})

const emit = defineEmits(['update:state', 'add'])

const errors = ref([])

const update = (key, value) => {
  emit('update:state', { ...props.state, [key]: value })
}

const updateUi = (key, value) => {
  emit('update:state', { ...props.state, ui: { ...props.state.ui, [key]: value } })
}

const BAR_OPTIONS = Object.freeze([10, 20])
const SIDE_OPTIONS = Object.freeze([1.25, 2.5, 5, 10, 15, 20])

const selectedBar = ref([])
const selectedSide = ref([])

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
        weight: totalWeight.value
      })
    },
    { immediate: true }
)

watch(
    () => props.state,
    (s) => {
      if (!s?.bar && !s?.side && !s?.weight) {
        selectedBar.value = []
        selectedSide.value = []
        errors.value = []
      }
    },
    { deep: true }
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
</script>

<template>
  <section class="block">
    <h2>Добавление тренировки</h2>

    <div class="grid">
      <label class="field">
        <span>Группа мышц</span>
        <input
            :value="state.muscleGroup"
            type="text"
            @input="update('muscleGroup', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Упражнение</span>
        <input
            :value="state.workoutName"
            type="text"
            @input="update('workoutName', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Повторения</span>
        <input
            :value="state.reps"
            type="number"
            min="0"
            step="1"
            @input="update('reps', Number($event.target.value))"
        />
      </label>

      <div class="field full">
        <span class="title">Штанга</span>

        <div class="checks">
          <label v-for="w in BAR_OPTIONS" :key="w" class="check">
            <input type="checkbox" :value="w" v-model="selectedBar" />
            <span>{{ w }} кг</span>
          </label>
        </div>
      </div>

      <div class="field full">
        <span class="title">Диски на одну сторону</span>

        <div class="checks">
          <label v-for="w in SIDE_OPTIONS" :key="w" class="check">
            <input type="checkbox" :value="w" v-model="selectedSide" />
            <span>{{ w }} кг</span>
          </label>
        </div>
      </div>

      <div class="field full summary">
        <div class="row">
          <span>Штанга:</span>
          <span class="mono">{{ barWeight }} кг</span>
        </div>
        <div class="row">
          <span>Одна сторона:</span>
          <span class="mono">{{ sideWeight }} кг</span>
        </div>
        <div class="row total">
          <span>Итого:</span>
          <span class="mono">{{ totalWeight }} кг</span>
        </div>
      </div>

      <label class="field full">
        <span>Заметка</span>
        <input
            :value="state.note"
            type="text"
            @input="update('note', $event.target.value)"
        />
      </label>

      <label class="field full rowLine">
        <span>Показывать подсказки</span>
        <input
            type="checkbox"
            :checked="state.ui.showHelp"
            @change="updateUi('showHelp', $event.target.checked)"
        />
      </label>
    </div>

    <div v-if="errors.length" class="errors">
      <div v-for="e in errors" :key="e" class="error">{{ e }}</div>
    </div>

    <div class="actions">
      <button class="btn primary" type="button" @click="add">
        Добавить в таблицу
      </button>
    </div>
  </section>
</template>

<style scoped>
/* твой style без изменений */
.block { padding: 16px; border: 1px solid #2b2b2b; border-radius: 12px; background: #121212; display: grid; gap: 16px; }
.grid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.field { display: grid; gap: 6px; }
.field span { font-size: 12px; color: #bdbdbd; }
.field input[type="text"], .field input[type="number"] { padding: 10px 12px; border: 1px solid #2b2b2b; border-radius: 10px; background: #0f0f0f; color: #f3f3f3; }
.field.full { grid-column: 1 / -1; }
.title { font-size: 12px; color: #bdbdbd; }
.checks { display: flex; flex-wrap: wrap; gap: 10px; padding: 10px 12px; border: 1px solid #2b2b2b; border-radius: 10px; background: #0f0f0f; }
.check { display: inline-flex; align-items: center; gap: 8px; color: #e6e6e6; }
.check input { width: 18px; height: 18px; }
.summary { padding: 10px 12px; border: 1px solid #2b2b2b; border-radius: 10px; background: #0f0f0f; display: grid; gap: 6px; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.total { margin-top: 4px; padding-top: 8px; border-top: 1px solid #2b2b2b; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.rowLine { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid #2b2b2b; border-radius: 10px; background: #0f0f0f; }
.errors { padding: 10px 12px; border: 1px solid #5a2b2b; border-radius: 10px; background: #2a1414; display: grid; gap: 6px; }
.error { color: #ffd1d1; font-size: 13px; }
.actions { display: flex; justify-content: flex-end; }
.btn { border: 1px solid #2b2b2b; border-radius: 10px; padding: 10px 14px; background: #1b1b1b; color: #f3f3f3; cursor: pointer; }
.btn.primary { border-color: #2f4fbf; background: #1a2b66; }
@media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }
</style>
