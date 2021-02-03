// brought currentuser from common here because if the user deletes the user and the trys to use its
// cookie it will still work
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {User} from './../models/user'

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    const desUser = await User.findById(payload.id)
    if(!desUser){
      return next();
    }
    req.currentUser = payload;
  } catch (err) {}

  next();
};