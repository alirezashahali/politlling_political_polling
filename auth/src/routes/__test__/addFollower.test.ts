import request from 'supertest'
import mongoose from 'mongoose'
import {app} from './../../app'
import { User } from '../../models/user'

it('errors when you try to follow a user unautherized', async () => {
  const mainUser = await global.createUser('king', 'king@king.com', '918273')
  const mainUserCookie = global.cookieFromUser(mainUser)
  const sideKick1 = await global.createUser('kink1', 'k@k.com', 'tettttt')

  return await request(app).patch('/api/users/follow').send({'userId': sideKick1.id}).expect(401)
})

it('errors when you try to follow a user that does not exist', async () => {
  const mainUser = await global.createUser('king', 'king@king.com', '918273')
  const mainUserCookie = global.cookieFromUser(mainUser)
  const sideKick1 = await global.createUser('kink1', 'k@k.com', 'tettttt')

  return await request(app).patch('/api/users/follow').set('Cookie', mainUserCookie).send({
    userId: mongoose.Types.ObjectId()
  }).expect(400)
})

it('errors when you try to follow yourself', async () => {
  const mainUser = await global.createUser('king', 'king@king.com', '918273')
  const mainUserCookie = global.cookieFromUser(mainUser)

  return await request(app).patch('/api/users/follow').set('Cookie', mainUserCookie).send({
    userId: mainUser.id
  }).expect(400)
})

it('when you follow a user twice it unfollows', async () => {
  const mainUser = await global.createUser('king', 'king@king.com', '918273')
  const mainUserCookie = global.cookieFromUser(mainUser)
  const sideKick1 = await global.createUser('kink1', 'k@k.com', 'tettttt')

  await request(app).patch('/api/users/follow').set('Cookie', mainUserCookie).send({
    userId: sideKick1.id
  }).expect(200)

  const sideKick1First = await User.findById(sideKick1.id)
  expect(sideKick1First.numberOfFollowers).toBe(1)
  const mainUserFirst = await User.findById(mainUser.id)
  expect(mainUserFirst.numberOfFollowings).toBe(1)

  await request(app).patch('/api/users/follow').set('Cookie', mainUserCookie).send({
    userId: sideKick1.id
  }).expect(200)

  const sideKick1Second = await User.findById(sideKick1.id)
  expect(sideKick1Second.numberOfFollowers).toBe(0)
  const mainUserSecond = await User.findById(mainUser.id)
  expect(mainUserSecond.numberOfFollowings).toBe(0)
})

it('when you try to follow yourself does not do anything', async() => {
  const mainUser = await global.createUser('king', 'king@king.com', '918273')
  const mainUserCookie = global.cookieFromUser(mainUser)

  return await request(app).patch('/api/users/follow').set('Cookie', mainUserCookie).send({
    userId: mainUser.id
  }).expect(400)
})