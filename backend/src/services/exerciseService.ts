import Exercise, { IExercise } from "../models/Exercise.js"

// Get all available exercises
export const getAllExercises = async () => {
    return await Exercise.find().sort('name');
}

// Create a new exercise (Admin/Coach only)
export const createExercise = async (exerciseData: Partial<IExercise>) => {
    return await Exercise.create(exerciseData);
}