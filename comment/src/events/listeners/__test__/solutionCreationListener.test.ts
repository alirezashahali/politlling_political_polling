import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {SolutionCreationEvent} from '@politling_common/common'
import {SolutionCreationListener} from './../../listeners/solutionCreationListener'
import {Solution, SolutionDoc} from './../../../models/solution'
import {queueGroupName} from './../../listeners/queue-group-name'
import {natsWrapper} from './../../../nats-wrapper'

const setUp = async () => {
  //create an instance of the listener
  const listener = new SolutionCreationListener(natsWrapper.client, queueGroupName, Solution)

  const ids = [mongoose.Types.ObjectId().toHexString(), mongoose.Types.ObjectId().toHexString()]

  //create a fake data event
  const data: SolutionCreationEvent['data'] = {
    userId: mongoose.Types.ObjectId().toHexString(),
    issueId: mongoose.Types.ObjectId().toHexString(),
    solutions: [{id: ids[0], title: 'suckers', description: "suck"},
      {id: ids[1], title: 'sucker', description: "sucks"}
    ]
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {listener, ids, data, msg}
}

it('acks the message', async (done) => {
  const {listener, ids, data, msg} = await setUp()

  await listener.onMessage(data, msg)

  setImmediate(async () => {
    expect(msg.ack).toHaveBeenCalledTimes(1);
    done()
  })
})

it('creats the solutions upon recieving the data', async (done) => {
  const {listener, ids, data, msg} = await setUp()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  setImmediate(async() => {
    for(const i in ids){
      const id = ids[i]
      console.log('id', id)
      const solution = await Solution.findById(id)
      const solutionInData = data.solutions.find((el) => el.id === id)
  
      expect(solution).not.toBe(null)
      expect(solution.id).toBe(solutionInData?.id)
      expect(solution.userId).toBe(data.userId)
      expect(solution.issueId).toBe(data.issueId)
      expect(solution.title).toBe(solutionInData?.title)
      expect(solution.description).toBe(solutionInData?.description)
    }
  })
  done()
})