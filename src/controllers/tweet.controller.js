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
        owner
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
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}