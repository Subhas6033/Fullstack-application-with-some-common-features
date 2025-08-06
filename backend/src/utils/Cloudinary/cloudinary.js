import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // localFilePath = req.file?.path
    // fs.unlinkSync(localFilePath)
    // If file uploaded succesfully
    return response;
  } catch (error) {
    //Remove the locally saved temporary file as the upload operatrion got failed

    if (localFilePath && typeof localFilePath === "string" && fs.existsSync(localFilePath)) {
      {
      fs.unlinkSync(localFilePath)
    }}

    console.log(`File upload Err!! coming from cloudinary ${error}`)
    return null;
  }
};

export {uploadOnCloudinary}