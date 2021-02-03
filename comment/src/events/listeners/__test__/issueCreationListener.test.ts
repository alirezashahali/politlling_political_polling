import {Message} from 'node-nats-streaming'
import mongoose from 'mongoose'
import {IssueCreationEvent} from '@politling_common/common'
import {IssueCreationListener} from '../issueCreationListener'
import {natsWrapper} from '../../../nats-wrapper'
import {Issue} from '../../../models/issue'

const setUp = async () => {
  // create an instance of the listener
  const listener = new IssueCreationListener(natsWrapper.client)

  //create a fake data event
  const data: IssueCreationEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'suckers',
    description: 'sucks'
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg}
}

it('creats and saves an issue upon recieving the event', async () => {
  const {listener, data, msg} = await setUp()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertion to make sure an issue was created
  const issue = await Issue.findById(data.id)

  expect(issue).toBeDefined()
  expect(issue.title).toEqual(data.title)
  return expect(issue.description).toEqual(data.description)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setUp()
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertions to make sure ack function is called
  return expect(msg.ack).toHaveBeenCalled()
})