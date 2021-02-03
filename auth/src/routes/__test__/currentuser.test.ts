import request from 'supertest'
import {authenticator} from './../../services/authenticator'
import {app} from './../../app'

it('when cookie is set current users email is the right one', async() => {
  const cookie = await authenticator()

  const res = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200)
  return expect(res.body.currentUser.email === "test@test.com")
})

it('returns null when no cookie is set', async() => {
  const res = await request(app).get('/api/users/currentuser').send()
  return expect(res.body.currentUser === null)
})