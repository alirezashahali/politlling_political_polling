import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import {User} from '../models/user'

// TODO make it a sort of abstract class with a method that get the user model and works, place it in common

interface UserPayload {
  id: string,
  email: string
}

declare global {
  namespace express{
    interface Request{
      currentUser?: UserPayload
    }
  }
}

export const currentUser = async (
  req: Request, res: Response, next: NextFunction
) => {
  if(!req.session?.jwt){
    return next()
  }
  try{
    const payload = jwt.verify(req.session.jwt, 
      process.env.JWT_KEY!) as UserPayload
    const user = await User.findById(payload.id)
    if(user){
      req.currentUser = payload
    }
  }catch(err){}
  next()
}