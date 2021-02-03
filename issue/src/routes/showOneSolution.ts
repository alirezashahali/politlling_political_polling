import { BadRequestError } from '@politling_common/common'
import express, {Request, Response, NextFunction} from 'express'
import {Solution} from './../models/solution'
import {sanitizeOne} from './../services/sanitizer'

const router = express.Router()

router.get('/api/issues/solution/:solutionId', async (req: Request, res: Response, next: NextFunction) => {
  const {solutionId} = req.params
  const id = sanitizeOne(solutionId)
  const solution = await Solution.findById(id)
  
  if(!solution){
    return next(new BadRequestError('the solution you ask for does not exist'))
  }
  // TODO does not populate at once and should a sort of stream if it wants to see objections and comments and other goodies
  res.send(solution)
})

export {router as showOneSolutionRouter}