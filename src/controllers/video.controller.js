import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400,"Title and Description both are required!!")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is missing!!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if(!videoFile.url){
        throw new ApiError(400, "Error while uploading the video!!")
    }
    
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail file is missing!!")
    }
    console.log("Uploading!!")

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail.url){
        throw new ApiError(400, "Error while uploading the thumbnail!!")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id
    })

    if(!video){
        throw new ApiError(500,"Video object could not be created!!")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, video,"Video Uploaded Successfully✅")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400,"VideoId is required!!")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404,"Video not found!!")
    }

    res
    .status(200)
    .json(
            new ApiResponse(200,video,"Video acquired!!")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body
    const thumbnailLocalPath = req.file?.path;
    //TODO: update video details like title, description, thumbnail
    if (!videoId) {
        throw new ApiError(400,"VideoId is required!!")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    let thumbnail;
    if(thumbnailLocalPath){
        console.log("Uploading Thumbnail!!")
        
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail.url){
            throw new ApiError(400, "Error while uploading the thumbnail!!")
        }
    }
        
    const video = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail: thumbnail?.url || thumbnail,
        }
    },{
        new: true
    })

    if (!video) {
        throw new ApiError(500,"Video details didnot update!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,video,"Title,description and thumbnail Updated!!✅")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}