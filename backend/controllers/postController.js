import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import {v2 as cloudinary} from 'cloudinary'

const createPost = async (req,res)=>{
  try {
    const {postedBy, text} = req.body
    let {img} = req.body

    if(!postedBy || !text)return res.status(400).json({message: 'Postedby and text fields are required'})

    const user = await User.findById(postedBy)
    if(!user) return res.status(404).json({error: 'User not found'})

    if(user._id.toString() !== req.user._id.toString()) return res.status(401).json({error: 'Unauthorized to create post'})

    const maxLength = 500
    if(text.length > maxLength) return res.status(400).json({error: `Text must be less than ${maxLength}`})

    if(img){
      const uploadedResponse = await cloudinary.uploader.upload(img)
      img = uploadedResponse.secure_url
    }

    const newPost = new Post({
      postedBy, 
      text,
      img
    })

    await newPost.save()

    res.status(201).json(newPost)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in createPost', error.message)
  }
}

const getPost = async (req, res) =>{
  try {
    const post = await Post.findById(req.params.id)
    
    if(!post) return res.status(404).json({error: 'Post not found'})
    
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in getPost', error.message)
  }
}

const deletePost = async (req, res) =>{
  try {
    const post = await Post.findById(req.params.id)
    if(!post) return res.status(404).json({error: 'Post not found'})
    
    if(post.postedBy.toString() !== req.user._id.toString()) return res.status(401).json({error: 'Unathorized to delete the post'})

    if(post.img){
      const imgId = post.img.split('/').pop().split('.')[0]
      await cloudinary.uploader.destroy(imgId)
    }

    await Post.findByIdAndDelete(req.params.id)
    res.status(200).json({message: 'Post deleted successfully'})
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in deletePost', error.message)
  }
}

const likePost = async (req, res) =>{
  try {
    const {id: postId} = req.params
    const userId = req.user._id

    const post = await Post.findById(postId)
    const userLikedPost = post.likes.includes(userId)

    if(userLikedPost){
      //unlike post
      await Post.updateOne({_id:postId}, {$pull: {likes:userId}})
      res.status(200).json({message: 'Post unliked'})
    }else{
      post.likes.push(userId)
      post.save()
      res.status(200).json({message:'Post liked'})
    }
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in likePost', error.message)
  }
}

const replyToPost = async (req, res) =>{
  try {
    const {text} = req.body
    const postId = req.params.id
    const userId = req.user._id
    const userProfilePic = req.user.profilePic
    const username = req.user.username

    if(!text) return res.status(400).json({error: 'Text field is required'})
    
    const post = await Post.findById(postId)
    if(!post) return res.status(404).json({error: 'Post not found'})
    
    const reply = {userId, text, userProfilePic, username}

    post.replies.push(reply)
    post.save()

    res.status(200).json(reply)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in replyToPost', error.message)
  }
}

const getFeedPosts = async (req, res) =>{
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    if(!user) return res.status(404).json({error: 'User not found'})
    
    const following = user.following
    const feedPosts = await Post.find({postedBy: {$in:following}}).sort({createdAt: -1})

    res.status(200).json(feedPosts)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in getFeedPost', error.message)
  }
}

const getUserPosts = async (req, res) => {
  const {username} = req.params
  try {
    const user = await User.findOne({username}).select('-password').select('-updatedAt')
    if(!user) return res.status(404).json({error: 'User not found'})

    const posts = await Post.find({postedBy: user._id}).sort({createdAt: -1})

    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({error: error.message})
    console.log('Error in getFeedPost', error.message)
  }
}

export {createPost, getPost, deletePost, likePost, replyToPost, getFeedPosts, getUserPosts}