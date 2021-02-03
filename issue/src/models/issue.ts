import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
import {ModelTypes} from '@politling_common/common'
import {Solution, SolutionDoc} from './solution'
import {UserDoc} from './user'

//TODO do a declaration to get rid of ts-ignore

interface IssueAttrs{
  title: string,
  description: string,
  references?: Array<string>,
  user: UserDoc,
  // parent?: {type: ModelTypes, id: mongoose.Schema.Types.ObjectId},
  origin?: {type: ModelTypes, id: mongoose.Schema.Types.ObjectId},
}


export interface IssueDoc extends mongoose.Document{
  title: string,
  description: string,
  references: Array<string>,
  user: UserDoc,
  // issue does not have parent issue is a kind of fucking top dog
  // parent?: {type: ModelTypes, id: mongoose.Schema.Types.ObjectId},
  origin?: {type: ModelTypes, id: string},
  likes: string[],
  solutionLikes: string[],
  objections: string[],
  comments: string[],
  solutions: SolutionDoc[],
  version: number,
  timeOfCreation: Date,
  timeOfUpdate: Date,

  addSolutions(solutions: SolutionDoc[]): Promise<IssueDoc>,
  like(userId: string): Promise<void>,
  solutionLike(userId: string): Promise<void>,
  delete() : Promise<void>,
  deleteSolution(solutionId: string) : Promise<IssueDoc>
}

interface IssueModel extends mongoose.Model<IssueDoc>{
  build(attrs: IssueAttrs): IssueDoc
}

// TODO when you want to populate the solutions it should give them in a sort of lazy loading

const IssueSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  references: {
    type: Array,
    default: []
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IssueUser',
    required: true
  },
  origin:{
    type: Object,
  },
  likes: {
    type: Array,
    default: []
  },
  solutionLikes: {
    type: Array,
    default: []
  },
  numberOfLikes :{
    type: Number,
    default: 0
  },
  objections: {
    type: Array,
    default: []
  },
  comments: {
    type: Array,
    default: []
  },
  timeOfCreation: {
    type: Date,
    required: true
  },
  timeOfUpdate: {
    type: Date,
  },
  solutions: [
    {
      solution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Solution'
      }
    }
  ]
},{
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
})

IssueSchema.set('versionKey', 'version')
IssueSchema.plugin(updateIfCurrentPlugin)

IssueSchema.pre('save', async function(next) {
  const nowTime = new Date()
  //@ts-ignore
  this.timeOfUpdate = nowTime
  next()
})

IssueSchema.statics.build = (attrs: IssueAttrs) => {
  const timeOfNow = new Date()
  if(!attrs.origin){
    delete attrs.origin
    return new Issue({...attrs, timeOfCreation: timeOfNow});
  }
  return new Issue({...attrs, timeOfCreation: timeOfNow})
}

IssueSchema.methods.addSolutions = async function(solutions: SolutionDoc[]){
  //@ts-ignore
  this.solutions = [...this.solutions, ...solutions];
  await this.save();
  return this;
}

IssueSchema.methods.like = async function(userId : string) {
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

IssueSchema.methods.solutionLike = async function(userId : string) {
  //@ts-ignore
  const index = this.solutionLikes.indexOf(userId)
  if(index > -1){
    //@ts-ignore
    this.solutionLikes.splice(index, 1)
  }else{
    //@ts-ignore
    this.solutionLikes.push(userId)
  }
  await this.save()
}

//not only it should delete one but also delete all of its solutions
IssueSchema.methods.delete = async function() {
  // TODO could not find how to fix error when working with docker to use transaction, (fix it)
  // const listOfSolutions
  //@ts-ignore
  await Solution.deleteMany({parent: this.id})
  await Issue.deleteOne({_id: this.id})
}

IssueSchema.methods.deleteSolution = async function(solutionId: string) {
  //@ts-ignore
  const solutions = await this.solutions.filter(solution => solution._id.toString() !== solutionId)
  //@ts-ignore
  this.solutions = solutions
  await this.save()

  return this
}

const Issue = mongoose.model<IssueDoc, IssueModel>('Issue', IssueSchema)

export {Issue}