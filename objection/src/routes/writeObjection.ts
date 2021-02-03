import mongoose from 'mongoose'
import express, {Request, Response, NextFunction} from 'express'
import {userChecker, artifitialValidateRequest, NotFoundError, sanitizeOne, 
  BadRequestError, ModelTypes, ArtificialValidationError} from '@politling_common/common'
import {body} from 'express-validator'
import {currentUser} from './../services/currentuser'
// import {objection} from './../models/objection'
import {natsWrapper} from './../nats-wrapper'
import {referencesChecker} from './../services/referencesChecker'
import {Objection} from './../models/objection'

declare global {
  namespace Express {
    interface Request {
      customErrors?: ArtificialValidationError[];
    }
  }
}

const router = express.Router()

router.post('/api/objections/create', currentUser, userChecker, [
  body('parentType').isString().custom((vals: String) => {
    //@ts-ignore
    return Object.values(ModelTypes).includes(vals)
  }).withMessage('the parentType is not correctly formated'),
  body('parentId').isString().withMessage('the parentId is not the correctly formatted'),
  body('description').isString().withMessage('the description is not correctly formatted'),
  body('references').isArray().custom((vals : Array<string>, {req}) => {
    if (vals) {
      let listOfErrors: ArtificialValidationError[] = referencesChecker(vals);
      if (listOfErrors.length > 0) {
        req.customErrors = listOfErrors
      }
    }
    return true
  }).withMessage('the references is not the correctly formatted')
], artifitialValidateRequest, async(req: Request, res: Response, next: NextFunction) => {
  let {parentType, parentId, description, references} = req.body
})

export {router as writeObjectionRouter}