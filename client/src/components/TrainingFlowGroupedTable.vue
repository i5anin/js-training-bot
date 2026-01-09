<script setup>
  import { computed } from 'vue'
  import { formatIso, formatDateKey, toMoscowDayjs } from '@/shared/dayjs'

  const props = defineProps({
    entries: { type: Array, required: true },
  })

  const toUniqueNotes = (rows) => {
    const set = new Set(
      rows.map((x) => String(x.note || '').trim()).filter(Boolean)
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
  computed(() => {
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

        const da = toMoscowDayjs(a.trainingAtIso)?.valueOf() ?? 0
        const db = toMoscowDayjs(b.trainingAtIso)?.valueOf() ?? 0
        return db - da
      })
  })
</script>
