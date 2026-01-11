<script setup>
  import { computed } from 'vue'
  import { groupBy, pipe, sortBy, unique } from 'remeda'
  import { formatIso, formatDateKey, toMoscowDayjs } from '@/shared/dayjs'

  /**
   * @typedef {Object} TrainingEntry
   * @property {number} trainingNo
   * @property {string} trainingAtIso
   * @property {string} muscleGroup
   * @property {string} workoutName
   * @property {string} note
   * @property {number|string} weight
   * @property {number|string} reps
   */

  /**
   * @typedef {Object} TrainingGroup
   * @property {string} key
   * @property {number|null} trainingNo
   * @property {string|null} trainingAtIso
   * @property {string} muscleGroup
   * @property {string} workoutName
   * @property {TrainingEntry[]} rows
   * @property {string} dateText
   * @property {string} notesText
   * @property {string} setsText
   * @property {number} totalSets
   */

  /** @typedef {{ entries: TrainingEntry[] }} Props */

  const props = defineProps({
    entries: { type: Array, required: true },
  })

  const toTrimmed = (v) => String(v ?? '').trim()
  const toNum = (v) => Number(v ?? 0)

  const keyOf = (row) =>
    `${row.trainingNo ?? ''}__${formatDateKey(row.trainingAtIso)}__${toTrimmed(row.muscleGroup)}__${toTrimmed(row.workoutName)}`

  /** @type {import('vue').ComputedRef<TrainingGroup[]>} */
  const groups = computed(() => {
    /** @type {Record<string, TrainingEntry[]>} */
    const byKey = groupBy(props.entries, keyOf)

    /** @type {TrainingGroup[]} */
    const list = Object.entries(byKey).map(([key, rows]) => {
      /** @type {TrainingEntry | undefined} */

      const notesText =
        unique(rows.map((x) => toTrimmed(x.note)).filter(Boolean)).join(', ') ||
        '-'

      const setsText = pipe(
        rows,
        (r) => [...r],
        (r) => sortBy(r, [(x) => toNum(x.weight), 'asc']),
        (r) => r.map((x) => `${toNum(x.weight)}x${toNum(x.reps)}`).join('\n')
      )

      return {
        key,
        trainingNo: first?.trainingNo ?? null,
        trainingAtIso: first?.trainingAtIso ?? null,
        muscleGroup: first?.muscleGroup ?? '',
        workoutName: first?.workoutName ?? '',
        rows,
        dateText: formatIso(first?.trainingAtIso),
        notesText,
        setsText,
        totalSets: rows.length,
      }
    })

    return sortBy(
      list,
      [(g) => toNum(g.trainingNo), 'desc'],
      [(g) => toMoscowDayjs(g.trainingAtIso)?.valueOf() ?? 0, 'desc']
    )
  })
</script>

<template>
  <div v-if="groups.length === 0">Нет записей</div>

  <table v-else>
    <thead>
      <tr>
        <th>#</th>
        <th>Дата</th>
        <th>Группа</th>
        <th>Тренировка</th>
        <th>Сеты</th>
        <th>Всего сетов</th>
        <th>Заметки</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="g in groups" :key="g.key">
        <td>{{ g.trainingNo ?? '-' }}</td>
        <td>{{ g.dateText }}</td>
        <td>{{ g.muscleGroup || '-' }}</td>
        <td>{{ g.workoutName || '-' }}</td>
        <td>
          <pre>{{ g.setsText }}</pre>
        </td>
        <td>{{ g.totalSets }}</td>
        <td>{{ g.notesText }}</td>
      </tr>
    </tbody>
  </table>
</template>
