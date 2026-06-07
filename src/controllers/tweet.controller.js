import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {owner} = req.user._id;
    const {content} = req.body;

    if (!content) {
        throw new ApiError(400, "Require a Content to Tweet!!");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Unable to create Tweet!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet submitted Successfully!!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    const {page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    filter.owner = userId;
    const totaltweets = await Tweet.countDocuments(filter);
    const tweets = await Tweet.find(filter).skip(skip).limit(limitNumber);

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
            tweets,
            totaltweets,
            totalPage : Math.ceil(totaltweets/limitNumber)
        }, "All the tweet from the user is displayed!!")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {content} = req.body;



    if(!content){
        throw new ApiError(400,"The content of the tweet cannot be empty!!");
    }

    if (!tweetId) {
        throw new ApiError(400,"Tweet Id is required!!")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet.owner.equals(req.user._id)){
        throw new ApiError(401, "You cannot edit others tweet!!")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content
        }
    }, { new : true})

    if (!updatedTweet) {
        throw new ApiError(500,"The tweet couldnot be updated!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedTweet,"Tweet Updated Successfully!!")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    if (!tweetId) {
        throw new ApiError(400, "Tweet id not provided!! ")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet could not be found!!")
    }

    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(401, "You are not authorized for this action!!")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deleteTweet) {
        throw new ApiError(500, "Error while deleting the tweet!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteTweet, "The Tweet is deleted successfully!!")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}