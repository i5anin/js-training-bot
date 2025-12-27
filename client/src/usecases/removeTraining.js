import { TrainingRepository } from '@/repositories/trainingRepository'

export const removeTraining = async (id) => {
    await TrainingRepository.remove(id)
}
