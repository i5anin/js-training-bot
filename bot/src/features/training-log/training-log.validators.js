/**
 * Responsibility:
 * Содержит набор валидаторов пользовательского ввода для сценария логирования тренировки:
 * проверяет корректность значений для группы мышц, названия тренировки, веса и повторов.
 *
 * Модуль не управляет состоянием диалога, не выполняет форматирование, не взаимодействует
 * с хранилищем и не содержит бизнес-логики домена — только предикаты валидации ввода.
 */
export const Validators = {
  muscleGroup: (value) => value.trim().length > 0,
  workoutName: (value) => value.trim().length > 0,
  weight: (value) => Number.isFinite(Number(value)) && Number(value) > 0,
  reps: (value) => Number.isInteger(Number(value)) && Number(value) > 0,

  modifier: (value) => {
    const v = String(value).trim().replace(",", ".");
    if (!v) return false;
    const n = Number(v);
    return Number.isFinite(n);
  },

  note: (value) => String(value ?? "").trim().length > 0,
};
