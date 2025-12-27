<script setup>
import { computed } from 'vue'

const props = defineProps({
  entries: { type: Array, required: true },
})

const formatIso = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateKey = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const toUniqueNotes = (rows) => {
  const set = new Set(
      rows
          .map((x) => String(x.note || '').trim())
          .filter(Boolean)
  )
  return Array.from(set)
}

const toSetsText = (rows) =>
    rows
        .slice()
        .sort((a, b) => Number(a.weight || 0) - Number(b.weight || 0))
        .map((x) => `${Number(x.weight || 0)}x${Number(x.reps || 0)}`)
        .join('\n')

const groupKeyOf = (row) => {
  const no = row.trainingNo ?? ''
  const day = formatDateKey(row.trainingAtIso)
  const mg = String(row.muscleGroup || '').trim()
  const wn = String(row.workoutName || '').trim()
  return `${no}__${day}__${mg}__${wn}`
}

const grouped = computed(() => {
  const map = new Map()

  for (const row of props.entries) {
    const key = groupKeyOf(row)
    const current = map.get(key)

    if (!current) {
      map.set(key, {
        key,
        trainingNo: row.trainingNo ?? null,
        trainingAtIso: row.trainingAtIso ?? null,
        muscleGroup: row.muscleGroup ?? '',
        workoutName: row.workoutName ?? '',
        rows: [row],
      })
      continue
    }

    current.rows.push(row)
  }

  return Array.from(map.values())
      .map((g) => {
        const notes = toUniqueNotes(g.rows)
        return {
          ...g,
          dateText: formatIso(g.trainingAtIso),
          notesText: notes.length ? notes.join(', ') : '-',
          setsText: toSetsText(g.rows),
          totalSets: g.rows.length,
        }
      })
      .sort((a, b) => {
        const na = Number(a.trainingNo || 0)
        const nb = Number(b.trainingNo || 0)
        if (na !== nb) return nb - na

        const da = new Date(a.trainingAtIso || 0).getTime()
        const db = new Date(b.trainingAtIso || 0).getTime()
        return db - da
      })
})
</script>

<template>
  <section class="block">
    <header class="header">
      <h2>Сгруппированная таблица тренировок</h2>
      <span class="badge">Групп: {{ grouped.length }}</span>
    </header>

    <div class="tableWrap">
      <table class="table">
        <thead>
        <tr>
          <th class="num">№</th>
          <th>Дата</th>
          <th>Группа мышц</th>
          <th>Упражнение</th>
          <th class="num">Подходов</th>
          <th>Сеты (вес × повторы)</th>
          <th>Заметка</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="g in grouped" :key="g.key">
          <td class="num mono">{{ g.trainingNo ?? '-' }}</td>
          <td class="mono">{{ g.dateText }}</td>
          <td>{{ g.muscleGroup || '-' }}</td>
          <td>{{ g.workoutName || '-' }}</td>
          <td class="num mono">{{ g.totalSets }}</td>
          <td class="sets">
            <pre class="setsText">{{ g.setsText }}</pre>
          </td>
          <td class="note">{{ g.notesText }}</td>
        </tr>

        <tr v-if="grouped.length === 0">
          <td colspan="7" class="empty">Нет записей</td>
        </tr>
        </tbody>
      </table>
    </div>

    <details class="jsonBlock">
      <summary class="jsonTitle">JSON (группы)</summary>
      <pre class="json">{{ JSON.stringify(grouped, null, 2) }}</pre>
    </details>
  </section>
</template>

<style scoped>
.block {
  padding: 16px;
  border: 1px solid #2b2b2b;
  border-radius: 12px;
  background: #121212;
  display: grid;
  gap: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  padding: 6px 10px;
  border: 1px solid #2b2b2b;
  border-radius: 999px;
  color: #cfcfcf;
}

.tableWrap {
  overflow: auto;
  border: 1px solid #2b2b2b;
  border-radius: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

th, td {
  padding: 10px 12px;
  border-bottom: 1px solid #2b2b2b;
  text-align: left;
  white-space: nowrap;
  vertical-align: top;
}

thead th {
  position: sticky;
  top: 0;
  background: #161616;
  z-index: 1;
}

.num {
  text-align: right;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  color: #d7d7d7;
}

.sets {
  white-space: normal;
}

.setsText {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: #e6e6e6;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
}

.note {
  max-width: 360px;
  white-space: normal;
  overflow: hidden;
}

.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 16px;
}

.jsonBlock {
  border: 1px solid #2b2b2b;
  border-radius: 10px;
  background: #0f0f0f;
  overflow: hidden;
}

.jsonTitle {
  cursor: pointer;
  padding: 10px 12px;
  color: #cfcfcf;
  border-bottom: 1px solid #2b2b2b;
  user-select: none;
}

.json {
  margin: 0;
  padding: 12px;
  color: #dcdcdc;
  overflow: auto;
}
</style>
