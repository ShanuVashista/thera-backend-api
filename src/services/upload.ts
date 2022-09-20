/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import AWS from "aws-sdk";
import { Bucket_URI } from "../../constant";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadFile = async (request) => {
  try {
    const fileName = request.file.fieldname;

    const datetimestamp = Date.now();
    const file_new_name =
      request.file.fieldname +
      "-" +
      datetimestamp +
      "." +
      request.file.originalname.split(".")[
        request.file.originalname.split(".").length - 1
      ];
    const fileContent = Buffer.from(request.file.buffer, "binary");

    const params = {
      Bucket: Bucket_URI + request.db_response._id + "/image",
      Key: file_new_name,
      Body: fileContent,
    };
    const s3_response = s3.upload(params);

    if (!s3_response) throw s3_response;
    return await s3_response.promise();
  } catch (error) {
    return error;
  }
};

const deleteFile = async (request) => {
  try {
    const file = request.profile_image
      ? request.profile_image
      : request.profile_photo;
    const fileName = file.substring(file.lastIndexOf("/") + 1);

    const params = {
      Bucket: Bucket_URI + request._id + "/image",
      Key: fileName,
    };
    const s3_response = s3.deleteObject(params);

    if (!s3_response) throw s3_response;
    return await s3_response.promise();
  } catch (error) {
    return error;
  }
};

export default { uploadFile, deleteFile };
