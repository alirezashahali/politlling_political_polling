import {Publisher, IssueDeletionEvent, Subjects} from '@politling_common/common'

export class IssueDeletionPublisher extends Publisher<IssueDeletionEvent>{
  subject: Subjects.IssueDeletion = Subjects.IssueDeletion
}