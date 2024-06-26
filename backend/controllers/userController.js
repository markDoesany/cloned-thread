import User from '../models/userModel.js'
import Post from '../models/postModel.js'
import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from '../utils/helpers/generateTokenAndSetCookie.js'
import { v2 as cloudinary} from 'cloudinary'
import mongoose from 'mongoose'

const signupUser = async (req, res) =>{
  try {
    const {name, username, email, password} = req.body
    const user = await User.findOne({$or: [{email}, {username}]})

    if (user) return res.status(400).json({error: 'User already exist'})

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword
    })

    await newUser.save()

    if (newUser){
      generateTokenAndSetCookie(newUser._id, res)
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic
      })}else{
        res.status(400).json({error: 'Invalid user data'})
      }

  } catch (error) {
    res.status(500).json({ error: error.message })
    console.log('Error in signup User', error.message)
  }
}

const loginUser = async (req, res) =>{
  try {
    const {username, password} = req.body
    const user = await User.findOne({username})
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || '')

    if (!user || !isPasswordCorrect) return res.status(400).json({error: 'Invalid username or pasword'})

    if (user.isFrozen){
      user.isFrozen = false
      await user.save()
    }

    generateTokenAndSetCookie(user._id, res)
  
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic
    })

  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in loginUser', error.message)
  }
}

const logoutUser = async (req, res) =>{
  try {
    res.cookie('token','', {message:1})
    res.status(200).json({message: 'User logged out successfully'})
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in logoutUser', error.message)
  }
}

const followUnfollowUser = async (req, res) => {
  try {
    const {id} = req.params
    const userToModify = await User.findById(id)
    const currentUser  =  await User.findById(req.user._id)

    if(id === req.user._id.toString()) return res.status(400).json({error:'You cannot follow/unfollow yourself'})

    if(!userToModify) return res.status(400).json({error:'User not found'})
    
    const isFollowing = currentUser.following.includes(id)
    
    if(isFollowing){
      //Unfollow
      await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
      await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
      res.status(200).json({message: 'User unfollowed successfully'})
    }else{
      //follow
      await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
      await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
      res.status(200).json({message: 'User followed successfully'})
    } 


  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in followUnfollowUser', error.message)
  }
}

const updateUser = async (req, res) =>{
  const { name, username, email, password, bio} = req.body
  let {profilePic} = req.body

  const userId = req.user._id
  
  try {
    let user = await User.findById(userId)
    if (!user) return res.status(400).json({error: 'User not found'})
    
    if(req.params.id !== userId.toString()) return res.status(400).json({error: 'You cannot update other user profile'})

    if(password){
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
    }

    if(profilePic){
      if(user.profilePic){
        await cloudinary.uploader.destroy(user.profilePic.split('/').pop().split('.')[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic)
      profilePic = uploadedResponse.secure_url
    }

    user.name = name || user.name
    user.email = email || user.email
    user.username = username || user.username
    user.profilePic = profilePic || user.profilePic
    user.bio = bio || user.bio

    user = await user.save()

    //get all replies with the id and modify the username and profilepic\
    await Post.updateMany(
      {'replies.userId': userId},
      {$set: {
        'replies.$[reply].username': user.username,
        'replies.$[reply].profilePic': user.profilePic
      }},
      {arrayFilters: [{'reply.userId': userId}]}
    )

    user.password = null
    res.status(200).json(user)

  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in updateUser', error.message)
  }
}

const getUserProfile = async (req, res) =>{
  //query is either username or id
  const {query} = req.params
  try {
    let user;

    if(mongoose.Types.ObjectId.isValid(query)){
      user = await User.findOne({_id: query}).select('-password').select('-updatedAt')
    }else{
      user = await User.findOne({username: query}).select('-password').select('-updatedAt')
    }
    if(!user) return res.status(400).json({error: 'User not found'})
    
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in getUserProfile', error.message)    
  }
}

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id
    
    const usersFollowedByYou = await User.findById(userId).select('following')
    
    const users = await User.aggregate([
      {
      $match: {
        _id: {$ne: userId}
      },
      },
      {
        $sample: {size:10}
      }
  ])

    const filteredUsers = users.filter(user => {
      return !usersFollowedByYou.following.includes(user._id)
    })
    const suggestedUsers = filteredUsers.slice(0,4)

    suggestedUsers.forEach(user => {
      user.passsword = null
    })

    res.status(200).json(suggestedUsers)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in getSuggestedUsers', error.message)    
  }
}

const freezeAccount = async(req, res) =>{
  try {
    const user = await User.findById(req.user._id)

    if (!user){
      return res.status(400).json({error: 'User not found'})
    }

    user.isFrozen = true
    await user.save()

    res.status(200).json({success: true})
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in freezeAccount', error.message) 
  }
}

export {signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile, getSuggestedUsers, freezeAccount}