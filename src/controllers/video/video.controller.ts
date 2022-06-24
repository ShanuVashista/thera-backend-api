import Video from "../../db/models/video.model";
import { Request, Response, NextFunction } from "express";

export interface IVideo {
  isYoutube: boolean;
  title: string;
  url: string;
  uploaderId: string;
  patients: Array<string>;
}

const AddVideo = async (req, res, next) => {
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

const GetVideoList = async (req, res: Response, next: NextFunction) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    let { page, limit, sort, cond } = req.body;

    let uploaderId
    if (user.role_id === "doctor") {
      uploaderId = user._id
    } else {
      uploaderId = "user._id"

    }

    if (user.role_id === "patient") {
      //   cond = { uploaderId: user._id, ...cond };
      cond = { isdeleted: false, ...cond };
    }

    let search = "";
    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 9;
    }
    if (!cond) {
      cond = {}
    }
    if (!sort) {
      sort = { "createdAt": -1 }
    }
    if (typeof (cond.search) != 'undefined' && cond.search != null) {
      search = String(cond.search);
      delete cond.search;
    }

    cond = [
      {
        $match: {
          $and: [cond, {
            $or: [
              { "title": { $regex: search, '$options': 'i' } },
              { "url": { $regex: search, '$options': 'i' } },
              { "isdeleted": false },
              { "uploaderId": uploaderId },
            ]
          }]
        }
      },
      { $sort: sort },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          total: [
            {
              $count: 'count'
            }
          ]
        }
      }
    ]
    limit = parseInt(limit);
    const result = await Video.aggregate(cond)

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

const AssignVideoToPatient = async (req, res: Response, next: NextFunction) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const oldData = await Video.findOne({
      _id: id,
    });
    const tempArray = {};
    tempArray["oldData"] = oldData;

    const result = await Video.findByIdAndUpdate(
      {
        _id: id,
      },
      requestData
    );

    console.log(result);

    tempArray["newData"] = requestData;

    res.status(200).json({
      status: true,
      type: "success",
      message: "Video Assign To Patient Successfully",
      data: {
        requestData,
      },
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

export default {
  AddVideo,
  GetVideoList,
  AssignVideoToPatient,
};
