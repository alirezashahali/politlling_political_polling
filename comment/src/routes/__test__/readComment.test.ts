import request from 'supertest'
import mongoose from 'mongoose'
import {ModelTypes} from '@politling_common/common'
import {app} from './../../app'

it('gives the 401 respond when you are not authenticated', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).get(`/api/comments/comment/${comment.id}`).send().expect(401)
})

it('errors when trying to read a comment that does not exists', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).get(`/api/comments/comment/${mongoose.Types.ObjectId().toHexString()}`)
    .set('Cookie', cookie).send().expect(404)
})

it('reads the comment when everything is alright', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).get(`/api/comments/comment/${comment.id}`).set('Cookie', cookie)
    .send().expect(200)
})