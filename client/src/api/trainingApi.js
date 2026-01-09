import { axiosInstance } from '@/shared/api/axiosInstance'
import { handleResponse, handleApiError } from '@/shared/api/httpHandlers'

export const TrainingApi = Object.freeze({
  list: async () => {
    return axiosInstance
      .get('/trainings', {
        params: {
          _sort: 'createdAtIso',
          _order: 'desc',
        },
      })
      .then(handleResponse)
      .catch(handleApiError)
  },

  add: async (entry) => {
    return axiosInstance
      .post('/trainings', entry)
      .then(handleResponse)
      .catch(handleApiError)
  },

  remove: async (id) => {
    return axiosInstance
      .delete(`/trainings/${id}`)
      .then(handleResponse)
      .catch(handleApiError)
  },
})
