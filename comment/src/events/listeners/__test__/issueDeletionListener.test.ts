import {Message} from 'node-nats-streaming'
import mongoose from 'mongoose'
import {IssueDeletionEvent} from '@politling_common/common'
import {IssueDeletionListener} from './../../listeners/issueDeletionListener'
import {natsWrapper} from './../../../nats-wrapper'
import {Issue, IssueDoc} from './../../../models/issue'

const setUp = async () => {
  // create an instance of the listener
  const listener = new IssueDeletionListener(natsWrapper.client)

  // create an issue that has to be deleted after onMessage
  const userId = mongoose.Types.ObjectId().toHexString()
  const id = mongoose.Types.ObjectId().toHexString()

  // create a data event
  const data: IssueDeletionEvent['data'] = {
    id: id
  }

  // create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg, id, userId}
}

it('deletes the appropriate issue upon recieving the message', async () => {
  const {listener, data, msg, id, userId} = await setUp()

  //create an issue
  const issue = new Issue({_id: id, userId: userId, title : "sucker", description: "sucks"})
  await issue.save()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertion to make sure the issue has been wiped out
  const newIssue = await Issue.findById(id)

  return expect(newIssue).toBe(null)
})

it('acks the message', async () => {
  const {listener, data, msg, id, userId} = await setUp()

  const issue = new Issue({_id: id, userId, title: "sucker", description: "sucks"})
  await issue.save()

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertion to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled()
})

//TODO make the bellow shit to pass
it('does not ack when the version is not correct', async () => {

})