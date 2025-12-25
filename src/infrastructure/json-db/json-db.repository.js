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
