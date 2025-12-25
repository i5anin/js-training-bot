const BASE_URL = 'http://localhost:3005'

const request = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    })

    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text}`)
    }

    return res.status === 204 ? null : res.json()
}

export const TrainingApi = Object.freeze({
    list() {
        return request('/trainings?_sort=createdAtIso&_order=desc')
    },

    add(entry) {
        return request('/trainings', {
            method: 'POST',
            body: JSON.stringify(entry)
        })
    },

    remove(id) {
        return request(`/trainings/${id}`, { method: 'DELETE' })
    }
})
