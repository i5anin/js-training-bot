/**
 * Responsibility:
 * Создание полноценной записи таблицы из draft.
 */

import { IdGenerator } from './idGenerator'

export const TrainingEntryFactory = Object.freeze({
    create(draft) {
        return {
            id: IdGenerator.nextId(),
            createdAtIso: new Date().toISOString(),
            ...draft
        }
    }
})
