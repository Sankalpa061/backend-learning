import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import cloudinary from "cloudinary"

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
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404,"Video not found!!");
        }
        const url = video.thumbnail;
        let publicId = url.split("/upload/")[1].split(".")[0];
        if (publicId.startsWith("v")) {
            publicId = publicId.split("/").slice(1).join("/");
        }
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail.url){
            throw new ApiError(400, "Error while uploading the thumbnail!!")
        }
        if(publicId){
            await cloudinary.uploader.destroy(publicId);
        }
    }
        
    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail: thumbnail?.url || thumbnail,
        }
    },{
        new: true
    })

    if (!updatedVideo) {
        throw new ApiError(500,"Video details didnot update!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,updatedVideo,"Title,description and thumbnail Updated!!✅")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(400,"VideoId is required!!")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404,"Video not found!!");
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(401, "User is unauthorized for this action!!");
    }

    const videoUrl = video.videoFile;
    let videoPublicId = videoUrl.split("/upload/")[1];   // get part after /upload/
    videoPublicId = videoPublicId.substring(0, videoPublicId.lastIndexOf(".")); // remove extension

    if (videoPublicId.startsWith("v")) {
        videoPublicId = videoPublicId.split("/").slice(1).join("/");
    }
    if(videoPublicId){
        await cloudinary.uploader.destroy(videoPublicId, {
        resource_type: "video"
    });
    }
    
    const thumbnailUrl = video.thumbnail;
    let thumbnailPublicId = thumbnailUrl.split("/upload/")[1].split(".")[0];
    if (thumbnailPublicId.startsWith("v")) {
        thumbnailPublicId = thumbnailPublicId.split("/").slice(1).join("/");
    }
    if(thumbnailPublicId){
        await cloudinary.uploader.destroy(thumbnailPublicId);
    }

    const response = await Video.findByIdAndDelete(videoId);
    if(!response){
        throw new ApiError(500,"Error in deleting the video!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,null,"Video Deleted Successfully!!✅")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400,"Video Id not found!!")
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404,"Video not found!!");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    res.
    status(200)
    .json(
        new ApiResponse(200,video,"The publish status is toggled Successfully!!✅")
    )
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}