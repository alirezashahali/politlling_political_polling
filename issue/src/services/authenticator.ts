import request from 'supertest';
import {app} from './../app'

//returns the cookie for usage in testing because supertest
// does not include the cookie like browser does
export const params = {name: "test", email: "test@test.com", password: 'password'}

export const authenticator = async () => {
  const signedUpRes = await request(app)
    .post('/api/users/signup')
    .send({
      name: params.name,
      email: params.email,
      password: params.password
    }).expect(201);

    return signedUpRes.get('Set-Cookie')
}