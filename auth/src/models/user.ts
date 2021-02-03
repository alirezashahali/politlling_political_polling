import mongoose from 'mongoose';
import {Password} from './../services/password'
import {ModelTypes} from '@politling_common/common'

// TODO use s3 for image and other images in objections and others if it has a free tier

// TODO give user a isActive param and build a publisher for it and listen for it in all servieces

// TODO when liking and following give a sort of timestamp to give it more importance for search algorithms
// for now i decided to give the likes the time stamp and search considers only likes

//and interface that describes the properties that are required to create a new user
interface UserAttrs{
  email: string;
  password: string;
  name: string;
  intrestedFields: object[];
  activeFields: object[];
  biography: string;
  image: string;
  // followers: object[];
  // following: object[];
}

// an interface that describes the properties that a user document has
export interface UserDoc extends mongoose.Document{
  // role: string;
  email: string;
  password: string;
  name: string;
  intrestedFields?: object[];
  activeFields?: object[];
  biography?: string;
  image?: string;
  followers: object[];
  following: object[];
  listenForObjections: {type: ModelTypes, id: string, isActive: boolean}[]
  isIdentified: boolean;
  version: number
  numberOfFollowings: number
  numberOfFollowers: number

  tuggleFollowing(userId: string): Promise<boolean>
  tuggleFollower(userId: string): Promise<void>
}


interface UserModel extends mongoose.Model<UserDoc>{
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  intrestedFields:{
    type: Array,
    default: []
  },
  activeFields:{
    type: Array,
    default: []
  },
  biography:{
    type: String,
  },
  image:{
    type: String,
  },
  followers: {
    type: Array,
    required: true,
    default: []
  },
  following:{
    type: Array,
    required: true,
    default: []
  },
  listenForObjections:{
    type:Array,
    default: []
  },
  isIdentified:{
    type: Boolean,
    default: false
  },
  numberOfFollowers: {
    type: Number,
    default: 0
  },
  numberOfFollowings: {
    type: Number,
    default: 0
  }
},{
  toJSON: {
    versionKey: false,
    transform: (doc, ret) => {
      delete ret.password
      ret.id = ret._id
      delete ret._id
      delete ret.following
      delete ret.followers
    }
  }
});

userSchema.pre('save', async function (done) {
  if(this.isModified('password')){
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done();
})

userSchema.set('versionKey', 'version');

//TODO add a pre save hook to check for special key to check if its correct give the user the superUser role

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userSchema.methods.tuggleFollowing = async function(userId){
  //@ts-ignore
  const index = this.following.indexOf(userId)

  if(userId === this.id){
    return false
  }

  const followingUser = await User.findById(userId)
  // if no user exists with this id or your userid is equal to his we return
  if(!followingUser){
    return false
  }

  if(index > -1){
    //@ts-ignore
    this.following.splice(index, 1); this.numberOfFollowings -= 1
  }else{
    //@ts-ignore
    this.following.push(userId); this.numberOfFollowings += 1
  }
  await followingUser.tuggleFollower(this.id)
  await this.save()
  return true
}


userSchema.methods.tuggleFollower = async function(userId){
  //@ts-ignore
  const index = this.followers.indexOf(userId)
  if(index > -1){
    //@ts-ignore
    this.followers.splice(index, 1); this.numberOfFollowers -= 1
  }else{
    //@ts-ignore
    this.followers.push(userId); this.numberOfFollowers += 1
  }
  await this.save()
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };