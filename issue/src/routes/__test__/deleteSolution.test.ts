import mongoose from 'mongoose'
import request from 'supertest'
import {app} from './../../app'
import {setUp} from './deleteIssue.test'
import {Issue} from './../../models/issue'
import {Solution} from './../../models/solution'

it('errors when you are not logged in', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).delete(`/api/issues/solution/${res.body.solutions[0]._id}`)
    .send().expect(401)
})

it('errors when you try to delete a solution that does not exist', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).delete(`/api/issues/solution/${mongoose.Types.ObjectId()}`)
    .set('Cookie', cookie).send().expect(400)
})

it('errors when you try to delete a solution you have not built', async () => {
  const {user, cookie, res} = await setUp()
  const anotherUser = await global.createAnotherUser()
  const anotherCookie = global.cookieForUser(anotherUser)
  
  return await request(app).delete(`/api/issues/solution/${mongoose.Types.ObjectId()}`)
    .set('Cookie', anotherCookie).send().expect(400)
})

it('deletes the solution and also delete it from the list of the solutions of the issue', async () => {
  const {user, cookie, res} = await setUp()
  const solutionId = res.body.solutions[0]._id
  await request(app).delete(`/api/issues/solution/${solutionId}`).set('Cookie', cookie)
    .send()
  
  const issue = await Issue.findById(res.body.id)
  const solution = await Solution.findById(solutionId)
  expect(issue.solutions.length).toBe(0)
  expect(solution).toBe(null)
})

it('errors when you are trying to delete a solution which is confederate of another solution',
  async () => {
    
})

