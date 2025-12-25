import { TrainingFlowStep, TrainingFlowState } from "./training-log.flow.js";
import { Validators } from "./training-log.validators.js";
import { MuscleGroupsKeyboard, CancelKeyboard } from "./training-log.keyboard.js";
import { TrainingEntry } from "../../domain/training/training.entity.js";

export class TrainingLogHandlers {
    constructor({ groupsDbPath, logDbPath, jsonDb }) {
        this.groupsDbPath = groupsDbPath;
        this.logDbPath = logDbPath;
        this.jsonDb = jsonDb;
    }

    async start(ctx) {
        ctx.session.training = TrainingFlowState.createEmpty();
        const groups = await this.#loadGroups();

        await ctx.reply(
            "Введи название группы мышц (текстом):",
            { reply_markup: MuscleGroupsKeyboard.fromGroups(groups) }
        );
    }

    async onText(ctx) {
        const text = (ctx.message?.text ?? "").trim();
        if (!text) return;

        if (text.toLowerCase() === "отмена") {
            delete ctx.session.training;
            await ctx.reply("Операция отменена.", { reply_markup: { remove_keyboard: true } });
            return;
        }

        const state = ctx.session.training;
        if (!state) return;

        switch (state.step) {
            case TrainingFlowStep.MuscleGroup:
                await this.#handleMuscleGroup(ctx, text);
                return;

            case TrainingFlowStep.WorkoutName:
                await this.#handleWorkoutName(ctx, text);
                return;

            case TrainingFlowStep.Weight:
                await this.#handleWeight(ctx, text);
                return;

            case TrainingFlowStep.Reps:
                await this.#handleReps(ctx, text);
                return;

            default:
                return;
        }
    }

    async #handleMuscleGroup(ctx, input) {
        if (!Validators.muscleGroup(input)) {
            await ctx.reply("Некорректно. Введи название группы мышц (текстом):");
            return;
        }

        const groups = await this.#loadGroups();
        const normalized = input.trim().toLowerCase();

        if (!groups.includes(normalized)) {
            await ctx.reply(
                "Такой группы нет в базе. Выбери из списка или введи корректное название:",
                { reply_markup: MuscleGroupsKeyboard.fromGroups(groups) }
            );
            return;
        }

        ctx.session.training.muscleGroup = normalized;
        ctx.session.training.step = TrainingFlowStep.WorkoutName;

        await ctx.reply("Ок. Теперь введи название тренировки:", {
            reply_markup: CancelKeyboard.create(),
        });
    }

    async #handleWorkoutName(ctx, input) {
        if (!Validators.workoutName(input)) {
            await ctx.reply("Некорректно. Введи название тренировки:");
            return;
        }

        ctx.session.training.workoutName = input.trim();
        ctx.session.training.step = TrainingFlowStep.Weight;

        await ctx.reply("Теперь введи вес (число, например 45):", {
            reply_markup: CancelKeyboard.create(),
        });
    }

    async #handleWeight(ctx, input) {
        if (!Validators.weight(input)) {
            await ctx.reply("Некорректно. Введи вес (число, больше 0):");
            return;
        }

        ctx.session.training.weight = Number(input);
        ctx.session.training.step = TrainingFlowStep.Reps;

        await ctx.reply("Теперь введи количество повторов (целое число):", {
            reply_markup: CancelKeyboard.create(),
        });
    }

    async #handleReps(ctx, input) {
        if (!Validators.reps(input)) {
            await ctx.reply("Некорректно. Введи количество повторов (целое число, больше 0):");
            return;
        }

        ctx.session.training.reps = Number(input);
        ctx.session.training.step = TrainingFlowStep.Done;

        const entry = TrainingEntry.create({
            userId: String(ctx.from.id),
            muscleGroup: ctx.session.training.muscleGroup,
            workoutName: ctx.session.training.workoutName,
            weight: ctx.session.training.weight,
            reps: ctx.session.training.reps,
        });

        await this.#appendLog(entry);

        delete ctx.session.training;

        await ctx.reply(
            [
                "Запись сохранена ✅",
                `Группа: ${entry.muscleGroup}`,
                `Тренировка: ${entry.workoutName}`,
                `Вес: ${entry.weight}`,
                `Повторы: ${entry.reps}`,
            ].join("\n"),
            { reply_markup: { remove_keyboard: true } }
        );
    }

    async #loadGroups() {
        const data = await this.jsonDb.read(this.groupsDbPath);
        const groups = Array.isArray(data.groups) ? data.groups : [];
        return groups.map((g) => String(g).trim().toLowerCase()).filter(Boolean);
    }

    async #appendLog(entry) {
        const data = await this.jsonDb.read(this.logDbPath);
        const items = Array.isArray(data.items) ? data.items : [];
        items.push(entry);
        await this.jsonDb.write(this.logDbPath, { items });
    }
}
