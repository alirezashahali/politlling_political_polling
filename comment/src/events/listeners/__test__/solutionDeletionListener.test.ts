import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {SolutionDeletionEvent} from '@politling_common/common'
import {SolutionDeletionListener} from './../../listeners/solutionDeletionListener'
import {Solution, SolutionDoc} from './../../../models/solution'
import {Issue, IssueDoc} from './../../../models/issue'
import {natsWrapper} from './../../../nats-wrapper'

const setUp = async () => {
  // designate an id for the solution
  const id: string = mongoose.Types.ObjectId().toHexString()

  // create listener
  const listener = new SolutionDeletionListener(natsWrapper.client)

  // create an issue
  const issue = Issue.build({id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(), title: "suckers", description: "sucks"
  })
  await issue.save()

  // create a solution
  const solutions = Solution.build({
    userId: issue.userId,
    issueId: issue.id,
    solutions: [{id: id, title: "sucker", description: "sucks"}]
  })
  
  for(const solution of solutions){
    await solution.save()
  }

  // create a fake data for deletion of solution
  const data: SolutionDeletionEvent['data'] = {
    ids: id
  }

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, id, data, msg}
}

it('acks the message after listening', async () => {
  const {listener, data, msg} = await setUp()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalledTimes(1)
})

it('delets the solution after getting the solution', async () => {
  const {listener, id, data, msg} = await setUp()
  await listener.onMessage(data, msg)

  listener.onMessage(data, msg)

  const solution = await Solution.findById(id)

  return expect(solution).toBe(null)
})

//TODO make the bellow shit to pass
it('does not ack when the version is not correct', async () => {

})