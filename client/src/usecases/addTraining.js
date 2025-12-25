import { TrainingRepository } from '@/repositories/trainingRepository'

export const addTraining = async (entry) => {
    return await TrainingRepository.add(entry)
}
