import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = ( pageNumber - 1 ) * limitNumber;

    const filter = {};
    if(!videoId){
        throw new ApiError(400,"Invalid video ID!!");
    }
    filter.video = videoId; 
    const totalComments = await Comment.countDocuments(filter);
    const comments = await Comment.find(filter)
    .skip(skip)
    .limit(limitNumber);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            comments,
            totalComments,
            totalPage : Math.ceil(totalComments/limitNumber)
        },"All the comments for this video are successfully displayed!!")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    if (!content) {
        throw new ApiError(400,"Empty content cannot be published!!")
    }
    if (!videoId) {
        throw new ApiError(400,"Must provide a videoId!!")
    }

    const comment = await Comment.create({
            content,
            video: videoId,
            owner: req.user._id,
        }) 
    
    if(!comment){
        throw new ApiError(500,"Comment object could not be created!!");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment, "Comment Successfully posted!!")
    );
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }