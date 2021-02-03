import {Message} from 'node-nats-streaming'
import {Listener, Subjects, AuthSignUpEvent} from '@politling_common/common'
import {User} from '../../models/user'
import {queueGroupName} from './queue-group-name'

export class SignUpListener extends Listener<AuthSignUpEvent>{
  subject : Subjects.AuthSignUp = Subjects.AuthSignUp;
  queueGroupName = queueGroupName

  async onMessage (data: AuthSignUpEvent['data'], msg: Message) {
    const user = User.build({id: data.id, name: data.name, email: data.email, image: data.image})
    await user.save()
    msg.ack()
  }
}