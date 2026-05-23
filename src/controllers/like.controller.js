import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400,"Video ID must be provided!!")
    }
    const filter = {};
    filter.video = videoId;
    filter.likedBy = req.user._id;

    const existingLike = await Like.findOne(filter);
    if (existingLike) {
        const response = await existingLike.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Video Successfully Unliked!!")
        )
    }
    
    const response = await Like.create({
        video : videoId,
        likedBy : req.user._id
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Video Successfully Liked!!")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400,"Comment ID must be provided!!")
    }
    const filter = {};
    filter.comment = commentId;
    filter.likedBy = req.user._id;

    const existingLike = await Like.findOne(filter);
    if (existingLike) {
        const response = await existingLike.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, response, "Comment Successfully Unliked!!")
        )
    }
    
    const response = await Like.create({
        comment : commentId,
        likedBy : req.user._id
    })
    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "Comment Successfully Liked!!")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const { page = 1, limit = 10, sortBy, sortType } = req.query
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1 )*limitNumber;
    const filter = {};
    filter.likedBy = req.user._id;
    filter.video = { $exists: true };

    const sort = {};
    if(sortBy){
        sort[sortBy] = sortType === "asc" ? 1:-1;
    } else {
        sort.createdAt = -1;
    }

    const totalLikedVideos = await Like.countDocuments(filter);
    const likedVideos = await Like.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber);
    
        return res
        .status(200)
        .json(
            new ApiResponse(200,{likedVideos,
                totalLikedVideos,
                totalPage : Math.ceil(totalLikedVideos/limitNumber)
            },"All the Liked videos acquired!!")
        )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}