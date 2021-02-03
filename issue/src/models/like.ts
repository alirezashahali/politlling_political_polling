// wanted to use it for liking but i changed my mind and made it redundant

import mongoose from 'mongoose'
import {likeModelTypes} from './../services/likeModelType'

//TODO add a sort of solution to help finding faster based on userId and model

interface LikeAttrs {
  userId: string,
  baseModel?: likeModelTypes,
  baseModelId: string
}

export interface LikeDoc extends mongoose.Document{
  userId: string,
  baseModelId: string,
  doesLike: boolean
}

interface LikeModel extends mongoose.Model<LikeDoc>{
  build(attrs: LikeAttrs): LikeDoc
}

const likeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  doesLike: {
    type: Boolean,
    required: true,
    default: true
  },
  baseModelId: {
    type: String,
    required: true
  }
},{
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id
      delete ret._id
    }
  }
})
// first checks which model is it about then trys to find the like if it exists changes the value and if
// not makes a new instance and make its value equal to true
likeSchema.statics.build = async (attrs: LikeAttrs) => {
  //see which one is then try to find if does not exist build else change the doesLike
  // TODO somehow make it a sort of function to avoid code duplication
  let like: LikeDoc
  let wasMadeBefore : boolean = false
  if(attrs.baseModel === likeModelTypes.issue){

    like = await LikeIssue.findOne({
      userId: attrs.userId, baseModelId: attrs.baseModelId
    })

    if(like){
      wasMadeBefore = true
      // if like exists change its value
      like.doesLike = !like.doesLike
    }else{
      wasMadeBefore = false
      like = new LikeIssue({
        userId: attrs.userId, baseModelId: attrs.baseModelId
      })

    }
  }else{
    like = await LikeSolution.findOne({
      userId: attrs.userId, baseModelId: attrs.baseModelId
    })

    if(like){
      wasMadeBefore = true
      // if like exists change its value
      like.doesLike = !like.doesLike
    }else{
      wasMadeBefore = false
      like = new LikeSolution({
        userId: attrs.userId, baseModelId: attrs.baseModelId
      })
    }
  }

  await like.save()

  return {wasMadeBefore, like}
}

const LikeIssue = mongoose.model<LikeDoc, LikeModel>('LikeIssue', likeSchema)
const LikeSolution = mongoose.model<LikeDoc, LikeModel>('LikeSolution', likeSchema)

export {LikeIssue, LikeSolution}