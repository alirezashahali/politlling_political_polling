import bcrypt from 'bcrypt'

export class Password{
  static toHash(pass: string){
    return bcrypt.hash(pass, 12)
  }
  static compare(entryPass: string, hash: string){
    return bcrypt.compare(entryPass, hash)
  }
}