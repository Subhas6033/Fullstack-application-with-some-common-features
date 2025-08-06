import { asyncHandeler } from "../utils//asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandeler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  console.log(fullName, userName, password, email);

  // Validation for empty value
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  // Check if users allready exits or not
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  console.log("Existed User Details : ", existedUser);
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  // check image file handelling in local
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("Avatar Local Path : ", avatarLocalPath);
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req?.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0];
  }

  // Check if avatar url is exist or not
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //  upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Check if avaatar is exist or not
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create users
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName,
  });

  // Find the user and remove the password and refresh tokeen from them
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("Created User Details : ", createdUser);

  // Check if users created succesfully or not
  if (!createdUser) {
    throw new ApiError(502, "Internal Server Err on regestering the users");
  }

  // Sent the response to the User
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User regitered successfully"));
});

const loginUser = asyncHandeler(async (req, res) => {
  // Get the details from the user
  // Check that if user is exist or not
  // Find the User
  // Validate the user data
  // Access and Refresh Tokens generate
  // Sent cookies
  // Login or Response sent to the Users

  // Get the details from the request body
  const { email, userName, password } = req.body;
  console.log(email, userName, password);

  // Check if username or email sent or not
  if (!(email || userName)) {
    throw new ApiError(401, "Email or Username required");
  }

  // Find the Users
  const userDetails = await User.findOne({
    $or: [{ userName }, { email }],
  });

  // Check exist or not
  if (!userDetails) {
    throw new ApiError(404, "User Does not exists");
  }

  // Validate the data
  const isPasswordValid = await userDetails.isPasswordCorrect(password);

  // If password not correct throw the err
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens and save in db
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userDetails._id
  );

  const loggedInUser = await User.findById(userDetails._id).select(
    "-password -refreshToken"
  );

  // Sent the data in cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandeler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandeler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // TODO: double check new password
  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "Password is not matching");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"));
});

const getCurrentUser = asyncHandeler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully");
});

// TODO: update the user details
const updateAccountDetails = asyncHandeler(async (req, res) => {
  if (!email || !userName) {
    throw new ApiError(400, "All fields are required");
  }

  const user = User.findByIdAndUpdate(
    req.body?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account updated successfully"));
});

const updateAvatarFiles = asyncHandeler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Avatar updated successfully"
    )
  );
});

const updateCoverImageFiles = asyncHandeler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing");
  }

  const coverImage = uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading the Cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).json(200, { user }, "Cover image updated successfully");
});

  // TODO: Delete the old images of avatar and coover images

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatarFiles,
  updateCoverImageFiles,
};
