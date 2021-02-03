import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {User} from './../models/user'

interface UserPayload{
  id: string,
  email: string
}

declare global{
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
    return next();
  }
  try{
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload
    const user = await User.findById(payload.id)
    if(user){
      req.currentUser = payload
    }
  }catch(err){}
  next()
}
