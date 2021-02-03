import { Publisher, Subjects, AuthSignUpEvent } from '@politling_common/common'

export class SignUpPublisher extends Publisher<AuthSignUpEvent>{
  subject: Subjects.AuthSignUp = Subjects.AuthSignUp
}