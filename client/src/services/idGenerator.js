/**
 * Responsibility:
 * Генератор id без внешних зависимостей.
 */

export const IdGenerator = Object.freeze({
  nextId() {
    return crypto.randomUUID()
  },
})
