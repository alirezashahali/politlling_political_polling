import request from 'supertest'
import {app} from './../../app'
import jwt from 'jsonwebtoken'

const password = "password"
const name = "test"
const email = "test@test.com"

const signUp = async () => {
  await request(app).post('/api/users/signup').send({
    email: email,
    password: password,
    name: name
  }).expect(201)
}

it('deletes cookies after you signout', async () => {
  await signUp();
  await request(app).post('/api/users/signin').send({
    emailOrUserName: email,
    password: password
  })

  const res = await request(app).post('/api/users/signout').send()

  const holeShit = res.get('Set-Cookie')[0].split('express:sess=')[1].split(';')[0]
  const cookieObj = JSON.parse((new Buffer(holeShit, 'base64')).toString('utf-8'))
  return expect(cookieObj.jwt).toEqual(null)
})