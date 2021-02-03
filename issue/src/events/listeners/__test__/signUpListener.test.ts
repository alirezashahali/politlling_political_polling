import {Message} from 'node-nats-streaming'
import mongoose from 'mongoose'
import {AuthSignUpEvent} from '@politling_common/common'
import {SignUpListener} from './../signUpListener'
import {natsWrapper} from './../../../nats-wrapper'
import {User} from './../../../models/user'

const setUp = async () => {
  // create an instance of the listener
  const listener = new SignUpListener(natsWrapper.client)

  // create a fake data event
  const data : AuthSignUpEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    name: "king",
    email: "k@k.com",
    version: 0
  }
  
  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return {listener, data, msg}
}

it('create and save the user with correct data', async () => {
  const {listener, data, msg} = await setUp()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  // write assertion to make sure a ticket was created
  const user = await User.findById(data.id)

  expect(user).toBeDefined()
  expect(user!.name).toEqual(data.name)
  expect(user!.email).toEqual(data.email)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setUp()
  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertion to make sure ack function is called
  return expect(msg.ack).toHaveBeenCalled()
})