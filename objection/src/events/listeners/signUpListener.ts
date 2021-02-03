import {Message, Stan} from 'node-nats-streaming'
import mongoose from 'mongoose'
import {Listener, Subjects, AuthSignUpEvent, UserDoc} from '@politling_common/common'
// import {User} from '../../models/user'
import {queueGroupName} from './queue-group-name'

export class SignUpListener extends Listener<AuthSignUpEvent>{
  subject : Subjects.AuthSignUp = Subjects.AuthSignUp;
  public queueGroupName : string
  public User: mongoose.Model<UserDoc>

  constructor(client: Stan, queGroupName: string, user: mongoose.Model<UserDoc>){
    super(client)
    this.queueGroupName = queGroupName
    this.User = user
  }

  async onMessage (data: AuthSignUpEvent['data'], msg: Message) {
    //@ts-ignore
    const user = this.User.build({id: data.id, name: data.name, email: data.email, image: data.image})
    await user.save()
    msg.ack()
  }
}