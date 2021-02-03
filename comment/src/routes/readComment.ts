import express, {Request, Response, NextFunction} from 'express'
import {userChecker, artifitialValidateRequest, NotFoundError, sanitizeOne,
  BadRequestError} from '@politling_common/common'
import {currentUser} from './../services/currentUser'
import {Comment} from './../models/comment'
import {natsWrapper} from './../nats-wrapper'

const router = express.Router()

router.get('/api/comments/comment/:commentId', currentUser, userChecker,
  async (req: Request, res: Response, next: NextFunction) => {
    let {commentId} = req.params
    commentId = sanitizeOne(commentId)
    const comment = await Comment.findById(commentId)
    if(!comment){
      return next(new NotFoundError())
    }
    res.send(comment)
})

export {router as readCommentRouter}