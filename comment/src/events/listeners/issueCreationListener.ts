import {Message} from 'node-nats-streaming'
import {Listener, Subjects, IssueCreationEvent} from '@politling_common/common'
import {queueGroupName} from './queue-group-name'
import {Issue} from '../../models/issue'

export class IssueCreationListener extends Listener<IssueCreationEvent>{
  subject: Subjects.IssueCreation = Subjects.IssueCreation
  queueGroupName = queueGroupName

  async onMessage(data: IssueCreationEvent['data'], msg: Message){
    const {id, userId, title, description} = data

    const issue = Issue.build({id, userId, title, description})
    await issue.save()
    msg.ack()
  }
}