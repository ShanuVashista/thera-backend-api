import Video from "../../db/models/video.model";
import { Response } from "express";
import mongoose from "mongoose";
const ObjectId = <any>mongoose.Types.ObjectId;

export interface IVideo {
  isYoutube: boolean;
  isdeleted: boolean;
  title: string;
  url: string;
  uploaderId: string;
  goalId: string;
  taskId: string;
  patients: Array<string>;
}

const AddVideo = async (req, res) => {
  const { isYoutube, title, url }: IVideo = req.body;

  const user = JSON.parse(JSON.stringify(req.user));
  if (user.role_id != "doctor") {
    return res.status(404).json({
      status: false,
      type: "success",
      message: "You are not authorise to add a Video",
    });
  }

  try {
    const neVideo = new Video({
      uploaderId: user._id,
      isYoutube,
      title,
      url,
    });
    await neVideo.save();

    res.status(201).json({
      status: true,
      type: "success",
      data: neVideo,
    });
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      status: false,
      message: "One Or More Required Field is empty",
    });
  }
};

const GetVideoList = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond, goalId, taskId } = req.body;

    let uploaderId = "";
    if (user.role_id === "doctor") {
      uploaderId = user._id;
    } else {
      uploaderId = "user._id";
    }

    let search = "";

    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 9;
    }
    if (!cond) {
      cond = {};
    }
    if (!goalId) {
      goalId = "";
    }
    if (!taskId) {
      taskId = "";
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }
    if (typeof cond.search != "undefined" && cond.search != null) {
      search = String(cond.search);
      delete cond.search;
    }

    if (user.role_id === "patient") {
      limit = parseInt(limit);

      const result = await Video.find({ taskId: taskId });

      return res.status(200).json({
        status: true,
        type: "success",
        message: "Video's Fetch Successfully",
        page: page,
        limit: limit,
        // totalPages: totalPages,
        // total: user[0].total.length != 0 ? user[0].total[0].count : 0,
        data: result,
      });
    }

    cond = [
      {
        $match: {
          isdeleted: false,
          uploaderId: ObjectId(uploaderId),
          goalId: ObjectId(goalId),
          taskId: ObjectId(taskId),
          $and: [
            cond,
            {
              $or: [
                { title: { $regex: search, $options: "i" } },
                { url: { $regex: search, $options: "i" } },
              ],
            },
          ],
        },
      },
      { $sort: sort },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [
            {
              $count: "count",
            },
          ],
        },
      },
    ];
    limit = parseInt(limit);

    const result = await Video.aggregate(cond);

    let totalPages = 0;
    if (result[0].total.length != 0) {
      totalPages = Math.ceil(result[0].total[0].count / limit);
    }

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Video's Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result[0].total.length != 0 ? result[0].total[0].count : 0,
      data: result[0].data,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const GetVideoById = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to get a Video Details",
      });
    }

    const result = await Video.findById({ _id: id });

    res.status(200).json({
      status: true,
      type: "success",
      message: "Video Details Fetch Successfully",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const AssignVideoToPatient = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to Assign the Video",
      });
    }

    const doc = await Video.findById(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Video not found",
      });
    }
    const tempArray = {};
    tempArray["oldData"] = doc;

    const oldPatinets = doc.patients;
    const newPatients = requestData.patients;

    for (let i = 0; i < newPatients.length; i++) {
      if (!oldPatinets.includes(newPatients[i])) {
        await doc.updateOne({ $push: { patients: newPatients[i] } });
      }
    }

    const updatedDoc = await Video.findById(id);

    tempArray["newData"] = requestData;

    res.status(200).json({
      status: true,
      type: "success",
      message: "Video Assign To Patient Successfully",
      data: {
        updatedDoc,
      },
    });
  } catch (error) {
    // console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

const EditVideo = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to Edit a Video Details",
      });
    }

    const result = await Video.findByIdAndUpdate(
      {
        _id: id,
      },
      requestData
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Video Details Updated Successfully",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

const DeleteVideo = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const newData = {
      isdeleted: true,
    };

    const result = await Video.findByIdAndUpdate(
      {
        _id: id,
      },
      newData
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Video Deleted Successfully",
      data: result,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

export default {
  AddVideo,
  GetVideoList,
  GetVideoById,
  AssignVideoToPatient,
  EditVideo,
  DeleteVideo,
};
