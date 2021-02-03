import util from 'util';
import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { ArtificialRequestValidationError, artifitialValidateRequest, ArtificialValidationError,
  BadRequestError, userChecker, sanitizeOne, ndFixer } from '@politling_common/common';
import { User } from '../models/user';
import {SignUpPublisher} from './../events/publishers/signUpPublisher'
import {natsWrapper} from './../nats-wrapper'
import {currentUser} from './../services/currentuser'
import {isEmail} from './../services/isEmail'
import {Password} from './../services/password'

//TODO finish functionality of the editAccount

declare global {
  namespace Express {
    interface Request {
      customErrors?: ArtificialValidationError[];
    }
  }
}

const router = express.Router()

// TODO add the rest of the parameters
router.patch('/api/users/edit', currentUser, userChecker, [
  body('name').trim().custom((val) => {
    if(val === undefined){
      return true
    }else if(typeof val === 'string'){
      return true
    }else{
      return false
    }
  }).withMessage('your name is not rightly formatted'),
  body('email').custom((val) => {
    if(val === undefined){
      return true
    }else{
      return isEmail(val)
    }
  }).withMessage('your email is not rightly formatted'),
  body('intrestedFields').isArray().custom((vals, {req}) => {
    if(!vals){
      return true
    }
    req.customErrors = []
    for(const i in vals){
      if(typeof vals[i] !== "string"){
        req.customErrors.push({msg: "the " + ndFixer(parseInt(i)) + 
        " Field is not correctly formatted", param: "intrestedFields"})
      }
    }
  }).withMessage('intrestedFields are not correctly formatted'),
  body('activeFields').isArray().custom((vals, {req}) => {
    if(!vals){
      return true
    }
    for(const i in vals){
      if(typeof vals[i] !== "string"){
        req.customErrors.push({
          msg: "the " + ndFixer(parseInt(i)) + " Field is not correctly formatted",
          param: "activeFields"
        })
      }
    }
  }).withMessage('activeFields are not correctly formatted'),
  body('biography').custom((val) => {
    if(!val){
      return true
    }
    if(typeof val !== "string"){
      return false
    }else{
      return true
    }
  }).withMessage("the biography is not correctly formatted"),
  body('image').custom((val) => {
    if(!val){
      return true
    }else if(typeof val !== "string"){
      return false
    }else{
      return true
    }
  }).withMessage("the image is not correctly formatted"),
  body('password').custom(async(val:string, {req}) => {
    // if name or email are not undefined password must be provided
    if(req.body.name || req.body.email){
      const user = await User.findById(req.currentUser!.id)
      val = sanitizeOne(val)
      if(!val){
        return false
      }
      if(user){
        if(!(await Password.compare(val, user.password))){
          return false
        }
      }
    }
    return true
  }).withMessage('your password is not correct')
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {

})

export {router as editAccountRouter}