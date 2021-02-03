import mongoose from 'mongoose'
import express, {Request, Response, NextFunction} from 'express'
import {userChecker, artifitialValidateRequest, NotFoundError, sanitizeOne,
  BadRequestError} from '@politling_common/common'
import {body} from 'express-validator'
import {currentUser} from './../services/currentUser'
import {Comment} from './../models/comment'
import {natsWrapper} from './../nats-wrapper'

const router = express.Router()

router.patch('/api/comments/comment', currentUser, userChecker,[
  body('commentId').notEmpty().isString().custom((val: string) => {
    return mongoose.Types.ObjectId.isValid(val)
  }).withMessage('the id of comment must be valid')
], artifitialValidateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const {commentId} = req.body
    const userId = req.currentUser!.id
    const comment = await Comment.findById(commentId)

    // if comment does not exists respond with 404
    if(!comment){
      return next(new NotFoundError())
    }
    const newComment = await comment.like(userId)

    res.send(newComment)
})

export {router as likeCommentRouter}