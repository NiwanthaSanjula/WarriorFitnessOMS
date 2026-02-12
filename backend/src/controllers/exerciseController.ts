import { Response, NextFunction } from "express";
import { CustomRequest } from "../types.js";
import * as exerciseService from "../services/exerciseService.js";

export const getExercises = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const exercises = await exerciseService.getAllExercises();
        res.status(200).json({
            status: 'success',
            results: exercises.length,
            data: { exercises}
        });

    } catch (error) {
        next(error)
    }
};

export const createNewExercise = async ( req: CustomRequest, res: Response, next: NextFunction ) => {
    try {
        const exercise = await exerciseService.createExercise(req.body);
        res.status(201).json({
            status: 'success',
            data: { exercise }
        })

    } catch (error) {
        next(error)
    }
} 