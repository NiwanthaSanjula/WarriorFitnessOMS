import { Request } from 'express'
import { IUser } from "./models/User.js";

export interface CustomRequest extends Request {
    user? : IUser;
}