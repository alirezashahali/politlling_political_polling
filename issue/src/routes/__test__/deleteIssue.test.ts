import request from 'supertest'
import mongoose from 'mongoose'
import {app} from './../../app'
import {Issue} from './../../models/issue'
import {Solution} from './../../models/solution'
import { natsWrapper } from './../../nats-wrapper'

export const setUp = async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const res = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
    "solutions": [{"title": "sucker", "description": "sucker"}]
  }).expect(201)

  return {user, cookie, res}
}

it('errors when you are not logged in', async () => {
  const {user, cookie, res} = await setUp()

  return await request(app).delete(`/api/issues/issue/${res.body.id}`).send().expect(401)
})

it('erorrs when you try to delete an issue you have not built', async () => {
  const {user, cookie, res} = await setUp()
  const anotherUser = await global.createAnotherUser()
  const anotherCookie = global.cookieForUser(anotherUser)

  return await request(app).delete(`/api/issues/issue/${res.body.id}`)
    .set('Cookie', anotherCookie).send().expect(400)
})

it('errors when the issue you are trying to delete does not exist', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).delete(`/api/issues/issue/${mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie).send().expect(400)
})

it('it deletes the issue and also its solutions', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const res = await request(app).post('/api/issues/create').set('Cookie', cookie).send({
    "title": "sucker",
    "description": "sucker",
    "solutions": [{"title": "sucker", "description": "sucker"}]
  }).expect(201)
  const solutionId = res.body.solutions[res.body.solutions.length - 1]._id
  await request(app).delete(`/api/issues/issue/${res.body.id}`).set('Cookie', cookie).send()
    .expect(200)

  const issue = await Issue.findById(res.body.id)
  const solution = await Solution.findById(solutionId)

  expect(issue).toBe(null)
  return expect(solution).toBe(null)
})

it('emits an event once', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issueId = await global.createIssue(user)

  await request(app).delete(`/api/issues/issue/${issueId}`).set('Cookie', cookie).send().expect(200)

  return expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
})


//TODO add the functionality and also write the damn test of it
it('if the issue has a solution which is confederatee of another solution it should not be allowed to be deleted unless that solution gets deleted first',
  async () => {

  }
)