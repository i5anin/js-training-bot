const BASE_URL = 'http://localhost:3005/trainings'

export const TrainingRepository = Object.freeze({
    async getAll() {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`GET trainings failed: ${res.status}`)
        return await res.json()
    },

    async add(entry) {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        })
        if (!res.ok) throw new Error(`POST trainings failed: ${res.status}`)
        return await res.json()
    },

    async remove(id) {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`DELETE trainings failed: ${res.status}`)
    }
})
