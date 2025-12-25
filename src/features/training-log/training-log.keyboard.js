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
