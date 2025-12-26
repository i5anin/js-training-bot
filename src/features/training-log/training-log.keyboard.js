/**
 * Responsibility:
 * Предоставляет фабрики клавиатур Telegram (grammy) для сценария логирования тренировки:
 * формирует разметку кнопок выбора группы мышц и кнопку отмены.
 *
 * Модуль не содержит логики валидации, управления состоянием диалога или бизнес-правил —
 * только построение UI-клавиатур на основе входных данных.
 */
import { Keyboard } from "grammy";

export const MuscleGroupsKeyboard = {
    fromGroups(groups) {
        const kb = new Keyboard().resized();
        for (const g of groups) kb.text(g);
        kb.row().text("Отмена");
        return kb;
    },
};

export const CancelKeyboard = {
    create() {
        return new Keyboard().text("Отмена").resized();
    },
};
