import express, {Request, Response, NextFunction} from 'express'
import {userChecker,
  BadRequestError} from '@politling_common/common'
// import {validateRequest} from './../services/requestValidateError'
import {Solution} from '../models/solution'
import {currentUser} from './../services/currentuser'
import {sanitizeOne} from './../services/sanitizer'
import {solutionDeletionPublisher} from './../events/publishers/solutionDeletionPublisher'
import {natsWrapper} from './../nats-wrapper'

const router = express.Router()

// TODO send notification when a solution gets deleted to the ones that like the solution but not sure yet

router.delete('/api/issues/solution/:solutionId', currentUser, userChecker,
  async (req: Request, res: Response, next: NextFunction) => {
    const {solutionId} = req.params
    const id = sanitizeOne(solutionId)
    
    const solution = await Solution.findById(id).populate('user')

    if(!solution){
      return next(new BadRequestError("such a solution does not exist"))
    }

    //checks if the user who made the solution is the same person who made the request
    if(req.currentUser!.id !== solution.user.id){
      return next(new BadRequestError('you can not delete the solution that some one else has build!'))
    }

    await solution.delete(solution.id)
    new solutionDeletionPublisher(natsWrapper.client).publish({
      ids: solution.id
    })

    return res.send('solution was successfully deleted')
})

export {router as deleteSolutionRouter}