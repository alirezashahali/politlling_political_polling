import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import {
  userChecker, BadRequestError, ModelTypes, artifitialValidateRequest,
  ArtificialValidationError, sanitizeOne, sanitizeList
} from '@politling_common/common'
import { body } from 'express-validator'
import { currentUser } from './../services/currentUser'
import { Comment } from './../models/comment'
import { natsWrapper } from './../nats-wrapper'
import {sanitizeAnObject} from './../services/sanitizeAnObject'
import {User} from './../models/user'
import {Issue} from './../models/issue'
import {Solution} from './../models/solution'
// import {validateRequest} from './../services/validateRequest'

const router = express.Router()

router.post('/api/comments/create', currentUser, userChecker, [
  body('parentType').isString().isLength({ min: 1 }).custom((input: string) => {
    //@ts-ignore
    return Object.values(ModelTypes).includes(input)
  }).withMessage('the object you are trying to comment on is not valid'),
  body('parentId').custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('a valid parentId must be provided'),
  body('description').isString().isLength({min: 1, max: 1000})
    .withMessage('a description must be provided for your comment to be created'),
  body('isASuggestedSolution').isBoolean()
    .withMessage('isASuggestedSolution must be provided with a boolean'),
  body('references').custom((val) => {
    if(val === undefined){
      return true
    }else if(typeof val === 'object' && val.length >= 0){
      return true
    }else{
      return false
    }
  }).withMessage('references should be provided in the format of an array')
], artifitialValidateRequest, async (req: Request, res: Response, next: NextFunction) => {
  let {parentId, parentType, description, isASuggestedSolution, references} = req.body
  const san = sanitizeAnObject({parentId, description, references})
  //@ts-ignore
  parentId = san.parentId; description = san.description; references = san.references
  const user = await User.findById(req.currentUser!.id)
  const comment = await  Comment.build({user, parentId, parentType,
    description, isASuggestedSolution, references})

  if(!comment){
    return next(new BadRequestError('the parentType or parentId is not correct'))
  }
  await comment.save()
  res.status(201).send(comment)
})

export {router as writeCommentRouter}