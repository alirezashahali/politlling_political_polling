import request from 'supertest'
import mongoose from 'mongoose'
import {app} from './../../app'
import {setUp} from './deleteIssue.test'

it('errors when you ask for an issue that does not exist', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).get(`/api/issues/solution/${mongoose.Types.ObjectId()}`).send().expect(400)
})

it('returns the solution when everything is allright', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).get(`/api/issues/solution/${res.body.solutions[0]._id}`).send().expect(200)
})