import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json, response } from "express"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400,"channel Id is not provided!!")
    }

    const filter = {};
    filter.subscriber = req.user._id;
    filter.channel = channelId;

    const subscribed = await Subscription.findOne(filter);
    if(subscribed){
        const response = await subscribed.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200,"Channel Unsubscribed Successfully!!")
        )
    }
    const response = await Subscription.create({
        channel : channelId,
        subscriber : req.user._id
    })
    if (!response) {
        throw new ApiError(500,"Error while subscribing to the channel!!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,response,"Channel Subscribed Successfully!!")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}