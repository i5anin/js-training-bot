import { TrainingRepository } from '@/repositories/trainingRepository'

export const loadTrainings = async () => {
    return await TrainingRepository.getAll()
}
