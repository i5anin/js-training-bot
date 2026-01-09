<script setup>
  import { onMounted, ref } from 'vue'
  import { TrainingFlowState } from '@/domain/trainingFlow'
  import { TrainingEntryRules } from '@/domain/trainingEntryRules'
  import { TrainingEntryFactory } from '@/services/trainingEntryFactory'
  import TrainingFlowEditor from '@/components/TrainingFlowEditor.vue'
  import TrainingFlowTable from '@/components/TrainingFlowTable.vue'
  import TrainingFlowGroupedTable from '@/components/TrainingFlowGroupedTable.vue'

  const BASE_URL = 'http://localhost:3005/trainings'

  const state = ref(TrainingFlowState.createEmpty())
  const entries = ref([])
  const error = ref(null)

  const fetchAll = async () => {
    const res = await fetch(BASE_URL)
    if (!res.ok) throw new Error(`GET trainings failed: ${res.status}`)
    return res.json()
  }

  const postEntry = async (entry) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    if (!res.ok) throw new Error(`POST trainings failed: ${res.status}`)
    return res.json()
  }

  const deleteEntry = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`DELETE trainings failed: ${res.status}`)
  }

  const refresh = async () => {
    entries.value = await fetchAll()
  }

  onMounted(async () => {
    try {
      await refresh()
    } catch (e) {
      error.value = e.message
    }
  })

  const add = async () => {
    const draft = TrainingEntryRules.fromState(state.value)
    const errors = TrainingEntryRules.validate(draft)
    if (errors.length > 0) return

    try {
      const entry = TrainingEntryFactory.create(draft)
      await postEntry(entry)

      state.value = {
        ...state.value,
        reps: null,
        note: '',
        bar: 0,
        side: 0,
        weight: 0,
        ui: state.value.ui ?? { showHelp: true },
      }

      await refresh()
    } catch (e) {
      error.value = e.message
    }
  }

  const remove = async (id) => {
    try {
      await deleteEntry(id)
      await refresh()
    } catch (e) {
      error.value = e.message
    }
  }
</script>

<template>
  <main class="layout">
    <div v-if="error" class="errorBox">{{ error }}</div>

    <TrainingFlowEditor
      :state="state"
      :entries="entries"
      @update:state="state = $event"
      @add="add"
    />
    <TrainingFlowGroupedTable :entries="entries" />
    <TrainingFlowTable :entries="entries" @remove="remove" />
  </main>
</template>

<style scoped>
  .layout {
    display: grid;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
  }

  .errorBox {
    padding: 10px 12px;
    border: 1px solid #5a2b2b;
    border-radius: 10px;
    background: #2a1414;
    color: #ffd1d1;
  }
</style>
