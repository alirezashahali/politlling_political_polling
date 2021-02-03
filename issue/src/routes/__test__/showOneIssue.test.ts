import request from 'supertest'
import mongoose from 'mongoose'
import {app} from './../../app'
import {Issue} from './../../models/issue'
import {setUp} from './deleteIssue.test'

it('errors when you ask for an issue that does not exist', async() => {
  const {user, cookie, res} = await setUp()
  return await request(app).get(`/api/issues/issue/${mongoose.Types.ObjectId()}`).send().expect(400)
})

it('returns the issue when everything is allright', async () => {
  const {user, cookie, res} = await setUp()
  return await request(app).get(`/api/issues/issue/${res.body.id}`).send().expect(200)
})