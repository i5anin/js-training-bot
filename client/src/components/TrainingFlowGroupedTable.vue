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

