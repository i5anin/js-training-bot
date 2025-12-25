/**
 * Responsibility:
 * Инкапсулирует операции чтения и записи JSON-данных в файловую систему:
 * читает файл по пути, парсит JSON и сохраняет данные в файл в формате JSON.
 *
 * Модуль не содержит бизнес-логики, не выполняет валидацию структуры данных
 * и не управляет доменными сущностями — только файловый JSON I/O как инфраструктурный слой.
 */
import { readFile, writeFile } from "node:fs/promises";

export class JsonDbRepository {
    async read(path) {
        const raw = await readFile(path, "utf-8");
        return JSON.parse(raw);
    }

    async write(path, data) {
        const json = JSON.stringify(data, null, 2);
        await writeFile(path, json, "utf-8");
    }
}
