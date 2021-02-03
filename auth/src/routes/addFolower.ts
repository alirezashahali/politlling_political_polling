import util from 'util';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { artifitialValidateRequest, BadRequestError, sanitizeOne, userChecker } from '@politling_common/common';
import { User } from '../models/user';
import {SignUpPublisher} from './../events/publishers/signUpPublisher'
import {natsWrapper} from './../nats-wrapper'
import {currentUser} from './../services/currentuser'

const router = express.Router()

router.patch('/api/users/follow', currentUser, userChecker, [
  body('userId').isString().custom(async (val:string, {req}) => {
    if(val === req.currentUser.id){
      return false
    }
    return true
  }).withMessage('userId does not exists or belong to yourself')
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction ) => {
  let {userId} = req.body
  userId = sanitizeOne(userId)
  const user = await User.findById(req.currentUser!.id)
  const returnie = await user.tuggleFollowing(userId)
  if(!returnie){
    return res.status(400).send('you can not follow yourself or a user that does not exist')
  }
  res.send('success')
})

export {router as addFollowerRouter}