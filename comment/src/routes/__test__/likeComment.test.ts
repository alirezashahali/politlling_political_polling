import request from 'supertest'
import {app} from './../../app'
import {ModelTypes} from '@politling_common/common'
import mongoose from 'mongoose'


it('errors when not authenticate', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).patch('/api/comments/comment')
    .send({ commentId: comment.id }).expect(401)
})

it('errors when the comment does not exists', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).patch('/api/comments/comment').set('Cookie', cookie).send({
    commentId: mongoose.Types.ObjectId().toHexString()
  }).expect(404)
})

it('returns with the 200 when every thing right', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  return await request(app).patch('/api/comments/comment').set('Cookie', cookie)
    .send({
      commentId: comment.id
    }).expect(200)
})

it('keeps track of number of likes/listenee correctly', async () => {
  const user = await global.createUser()
  const cookie = global.cookieForUser(user)
  const issue = await global.createIssue(user)
  const comment = await global.createComment(user, ModelTypes.Issue, issue.id)

  const newComment = await request(app).patch('/api/comments/comment').set('Cookie', cookie)
    .send({
      commentId: comment.id
    }).expect(200)

  console.log('newComment', newComment.body)
  
  // new comment gets liked by this user so get 1 like
  expect(newComment.body.numberOfListenie).toBe(1)

  const newerComment = await request(app).patch('/api/comments/comment').set('Cookie', cookie)
  .send({
    commentId: comment.id
  }).expect(200)

  // new comment gets liked again so removes the like
  return expect(newerComment.body.numberOfListenie).toBe(0)
})