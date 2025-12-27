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
    timeZone: 'UTC',
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
          <td class="mono">{{ formatIso(row.createdAtIso) }}</td>
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

.note {
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  text-align: right;
}

.empty {
  text-align: center;
  color: #9a9a9a;
  padding: 16px;
}

.btn {
  border: 1px solid #2b2b2b;
  border-radius: 10px;
  padding: 8px 10px;
  background: #1b1b1b;
  color: #f3f3f3;
  cursor: pointer;
}

.btn:hover {
  background: #232323;
}

.btn.danger {
  border-color: #5a2b2b;
  background: #2a1414;
}

.btn.danger:hover {
  background: #341818;
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
