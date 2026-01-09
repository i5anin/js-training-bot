<script setup>
defineProps({
  entries: {type: Array, required: true}
});
const emit = defineEmits(['remove'])

const remove = (id) => emit('remove', id)

const formatKg = (n) => `${Number(n || 0).toFixed(2).replace(/\.00$/, '')} кг`

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
    minute: '2-digit'
  })
}

const calcTotal = (row) => {
  const bar = Number(row.bar || 0)
  const side = Number(row.side || 0)
  return bar + side * 2
}
</script>

<template>
  <section class="block">
    <header class="header">
      <h2>Таблица тренировок</h2>
      <span class="badge">Записей: {{ entries.length }}</span>
    </header>

    <div class="tableWrap">
      <table class="table">
        <thead>
        <tr>
          <th class="num">№</th>
          <th>Дата</th>
          <th>Группа мышц</th>
          <th>Упражнение</th>
          <th class="num">Повторы</th>
          <th class="num">Штанга</th>
          <th class="num">Одна сторона</th>
          <th class="num">Итого</th>
          <th>Заметка</th>
          <th></th>
        </tr>
        </thead>

        <tbody>

        <tr v-for="row in entries" :key="row.id">
          <td class="num mono">{{ row.trainingNo ?? '-' }}</td>
          <td class="mono">{{ formatIso(row.trainingAtIso) }}</td>
          <td>{{ row.muscleGroup || '-' }}</td>
          <td>{{ row.workoutName || '-' }}</td>
          <td class="num mono">{{ row.reps ?? 0 }}</td>
          <td class="num mono">{{ formatKg(row.bar) }}</td>
          <td class="num mono">{{ formatKg(row.side) }}</td>
          <td class="num mono">{{ formatKg(calcTotal(row)) }}</td>
          <td class="note">{{ row.note || '-' }}</td>

          <td class="actions">
            <button class="btn danger" type="button" @click="remove(row.id)">
              Удалить
            </button>
          </td>
        </tr>

        <tr v-if="entries.length === 0">
          <td colspan="10" class="empty">Нет записей</td>
        </tr>
        </tbody>
      </table>
    </div>

    <details class="jsonBlock">
      <summary class="jsonTitle">JSON (все записи)</summary>
      <pre class="json">{{ JSON.stringify(entries, null, 2) }}</pre>
    </details>
  </section>
</template>


