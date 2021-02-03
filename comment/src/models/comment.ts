import mongoose from 'mongoose'
import {updateIfCurrentPlugin} from 'mongoose-update-if-current'
import {ModelTypes} from '@politling_common/common'
import {Issue, IssueDoc} from './../models/issue'
import {Solution, SolutionDoc} from './../models/solution'
import {User, UserDoc} from './user'

interface CommentAttrs{
  user: UserDoc,
  parentType: ModelTypes,
  parentId: string,
  description: string,
  isASuggestedSolution: boolean,
  references?: string[],
}

export interface CommentDoc extends mongoose.Document {
  user: UserDoc,
  parentType: ModelTypes,
  parentId: string,
  description: string,
  isASuggestedSolution: boolean,
  references: Array<string>,
  listenForArguments: Array<string>,
  children: {type: ModelTypes, id: string}[],
  timeOfCreation: Date,
  timeOfLastUpdate: Date,
  version: number,

  //TODO add addReferences, like, addChild, versionIncludedGet
  like(userId: string): Promise<CommentDoc>
}

interface CommentModel extends mongoose.Model<CommentDoc> {
  build(attrs: CommentAttrs): Promise<CommentDoc> | null | undefined
}

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommentUser',
    required: true
  },
  parentId: {
    type: String,
    required: true
  },
  parentType: {
    type: ModelTypes,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isASuggestedSolution: {
    type: Boolean,
    required: true
  },
  references: {
    type: [String],
    required: true,
    default: []
  },
  listenForArguments:{
    type: [String],
    required: true
  },
  numberOfListenie: {
    type: Number,
    default: 0
  },
  children: {
    type: [Object],
    default: []
  },
  timeOfCreation:{
    type: Date,
    required: true
  },
  timeOfLastUpdate: {
    type: Date
  }
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id
      delete ret._id
      delete ret.children
      // delete ret.listenForArguments
    }
  }
})

commentSchema.set('versionKey', 'version')
commentSchema.plugin(updateIfCurrentPlugin)

commentSchema.pre('save', async function(next){
  const updateTime : Date = new Date()
  //@ts-ignore
  this.timeOfLastUpdate = updateTime
  next()
})

commentSchema.statics.build = async (attrs: CommentAttrs) => {
  let member;
  switch(attrs.parentType) {
    case ModelTypes.Comment:
      member = await searcherBasedOfSchema(Comment, attrs.parentId)
      break;
    case ModelTypes.Issue:
      member = await searcherBasedOfSchema(Issue, attrs.parentId)
      break;
    case ModelTypes.Solution:
      member = await searcherBasedOfSchema(Solution, attrs.parentId)
      break;
    default:
      // code block
  }

  if(member){
    const time = new Date()
    return new Comment({...attrs, timeOfCreation: time})
  }
  return member
}

commentSchema.methods.like = async function(userId: string){
  //@ts-ignore
  const index = this.listenForArguments.indexOf(userId)

  if(index > -1){
    //@ts-ignore
    this.listenForArguments.splice(index, 1)
    //@ts-ignore
    this.numberOfListenie -= 1;
  }else{
    //@ts-ignore
    this.listenForArguments.push(userId)
    //@ts-ignore
    this.numberOfListenie += 1
  }

  this.save()
  return this
}

const Comment = mongoose.model<CommentDoc, CommentModel>('Comment', commentSchema)

export {Comment}

const searcherBasedOfSchema = async function(schema: mongoose.Model<IssueDoc> |
  mongoose.Model<SolutionDoc> | mongoose.Model<CommentDoc> , id: string){
    const member = await schema.findById(id)
    return member
}