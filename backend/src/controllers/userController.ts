import { Request, Response, NextFunction} from 'express';

export const getMe = ( req: Request, res: Response, next: NextFunction) => {

    //the 'protect' middleware already found the user and attached it to req.user
    const user = ( req as any ).user;

    res.status(200).json({
        status: 'success',
        data: {
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
};