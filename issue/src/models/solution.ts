import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
import {ModelTypes} from '@politling_common/common'
import {UserDoc} from './user'
import {Issue, IssueDoc} from './issue'


interface SolutionAttrs{
  parent: IssueDoc,
  user: UserDoc,
  title: string,
  description: string,
  references?: Array<string>,
  // likes: mongoose.Schema.Types.ObjectId[],
  // objections: mongoose.Schema.Types.ObjectId[],
  // comments: mongoose.Schema.Types.ObjectId[],
  // children: {type: ModelTypes, id: mongoose.Schema.Types.ObjectId},
  origin?: {type: ModelTypes, id: string}
}
// do not save objections and comments on this service because they might end up becoming a milion of
// them who knows/ prefer lazy loading or some kind
export interface SolutionDoc extends mongoose.Document{
  parent: IssueDoc,
  user: UserDoc,
  title: string,
  description: string,
  references?: Array<string>,
  // sugestedSolutionInItsPlace?: SolutionDoc,
  likes: string[],
  objections: string[],
  comments: string[],
  // children: {type: ModelTypes, id: string}[],
  origin?: {type: ModelTypes, id: string},
  version: number,
  timeOfCreation: Date,
  timeOfLastUpdate: Date,

  like(userId: string): Promise<void>,
  delete() : Promise<void>
}

interface SolutionModel extends mongoose.Model<SolutionDoc>{
  build(attrs: SolutionAttrs): SolutionDoc
}

const solutionSchema = new mongoose.Schema({
  parent:{
    // can not use ref because solution is used in issue and it will cause a maximum callstack errror
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "IssueUser",
    required: true
  },
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
  },
  references:{
    type: Array,
    default: []
  },
  likes:{
    type:Array,
    default: []
  },
  objections:{
    type:Array,
    default: []
  },
  comments: {
    type:Array,
    default: []
  },

  timeOfCreation: {
    type: Date,
    required: true
  },
  timeOfLastUpdate: {
    type: Date
  },
  origin:{
    type: Object
  },},
  {
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id
            delete ret._id
        }
    }
})

solutionSchema.set('versionKey', 'version');
solutionSchema.plugin(updateIfCurrentPlugin)

solutionSchema.pre('save', async function(next) {
  const timeOfNow = new Date()

  //@ts-ignore
  this.timeOfLastUpdate = timeOfNow
  next()
})

solutionSchema.statics.build = (attrs: SolutionAttrs) => {
  const timeOfNow = new Date()

  if(!attrs.references){
    delete attrs.references
    return new Solution({...attrs, timeOfCreation: timeOfNow});
  }
  return new Solution({...attrs, timeOfCreation: timeOfNow});
};

solutionSchema.methods.like = async function(userId: string){
  //@ts-ignore
  const index = this.likes.indexOf(userId)
  if(index > -1){
    //@ts-ignore
    this.likes.splice(index, 1)
  }else{
    //@ts-ignore
    this.likes.push(userId)
  }
  await this.save()
}

solutionSchema.methods.delete = async function () {
  // TODO use transaction and fix the error
  // crude functionality for now later will fix it
  // if confederation of solutions and also suggesting someOne elses solution in you issue becomes a
  // thing
  //@ts-ignore
  const issue = await Issue.findById(this.parent)
  
  // delete solution from issues solution
  //@ts-ignore
  //TODO also should add an arbitrary param to issue.deleteSolution to get session and do the rest on session

  await issue.deleteSolution(this.id)
  await Solution.deleteOne({_id: this.id})
}

const Solution = mongoose.model<SolutionDoc, SolutionModel>('Solution', solutionSchema);

export {Solution}