import Goals from "../../db/models/goals.model";
import Task from "../../db/models/task.model";
import Video from "../../db/models/video.model";
import PatientTask from "../../db/models/patientTask.model";
import { Response } from "express";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
const ObjectId = <any>mongoose.Types.ObjectId;

const CreateGoal = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    const newArr = req.body.task;

    const splitKeyValue = (obj) => {
      const keys = Object.keys(obj);
      const res = [];
      for (let i = 0; i < keys.length; i++) {
        res.push({
          _id: ObjectId(obj[keys[i]]),
        });
      }
      return res;
    };

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const result = new Goals({
      title: req.body.title,
      doctorId: req.user._id,
    });
    await result.save();

    const tasks = await Task.bulkWrite(
      newArr.map((task) =>
        task._id
          ? {
              updateOne: {
                filter: {
                  _id: task._id,
                  uploaderId: req.user._id,
                },
                update: {
                  ...task,
                  goalId: result._id,
                  uploaderId: req.user._id,
                },
              },
            }
          : {
              insertOne: {
                document: {
                  ...task,
                  goalId: result._id,
                  uploaderId: req.user._id,
                },
              },
            }
      )
    );

    const newTask = splitKeyValue(tasks.insertedIds);

    const requestData = {
      task: newTask,
    };

    let newResult;

    if (result._id) {
      newResult = await Goals.findByIdAndUpdate(
        {
          _id: result._id,
        },
        requestData
      );
    }

    const newData = await Goals.findById({ _id: result._id, isdeleted: false });

    // console.log(newData);

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Task added",
      data: newData,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const AssignVideoToTask = async (req, res: Response) => {
  try {
    const id = req.params.taskId;
    const user = JSON.parse(JSON.stringify(req.user));

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const newArr = req.body.video;

    const splitKeyValue = (obj) => {
      const keys = Object.keys(obj);
      const res = [];
      for (let i = 0; i < keys.length; i++) {
        res.push({
          _id: ObjectId(obj[keys[i]]),
        });
      }
      return res;
    };

    const videos = await Video.bulkWrite(
      newArr.map((video) =>
        video._id
          ? {
              updateOne: {
                filter: {
                  _id: video._id,
                  taskId: id,
                  uploaderId: req.user._id,
                },
                update: {
                  ...video,
                  taskId: id,
                  goalId: req.body.goalId,
                  uploaderId: req.user._id,
                },
              },
            }
          : {
              insertOne: {
                document: {
                  ...video,
                  taskId: id,
                  goalId: req.body.goalId,
                  uploaderId: req.user._id,
                },
              },
            }
      )
    );

    const newVideos = splitKeyValue(videos.insertedIds);

    const requestData = {
      videoId: newVideos,
    };

    let result;

    if (id) {
      result = await Task.findByIdAndUpdate(
        {
          _id: id,
        },
        requestData
      );
    }

    res.status(StatusCodes.OK).json({
      type: "success",
      status: true,
      message: "Task added",
      data: result,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const AssignGoalToPatient = async (req, res: Response) => {
  try {
    const id = req.params.goalId;
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const doc = await Goals.findById(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Task not found",
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

    const updatedDoc = await Goals.findById(id);

    tempArray["newData"] = requestData;

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Assign To Patient Successfully",
      data: {
        updatedDoc,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const AssignTaskToPatient = async (req, res: Response) => {
  try {
    const id = req.params.videoId;
    const { goalId, taskId, patients } = req.body;
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const doc = await Task.findById({ _id: taskId });
    const doc1 = await PatientTask.find({ videoId: id });

    console.log("doc1", doc1);

    if (!doc1) {
      console.log("yes", doc1);

      const tempVideoArray = {};
      tempVideoArray["oldData"] = doc1;

      const oldVideo = doc.patients;
      const newVideo = patients;
    } else {
      console.log("no", doc1);
    }

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Task not found",
      });
    }
    const tempArray = {};
    tempArray["oldData"] = doc;

    const oldPatinets = doc.patients;
    const newPatients = patients;

    for (let i = 0; i < newPatients.length; i++) {
      if (!oldPatinets.includes(newPatients[i])) {
        await doc.updateOne({ $push: { patients: newPatients[i] } });
        const newResult = new PatientTask({
          goalId: goalId,
          taskId: taskId,
          videoId: id,
          patientId: newPatients[i],
        });

        await newResult.save();
      }
    }

    const updatedDoc = await Goals.findById(id);

    tempArray["newData"] = requestData;

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Assign To Patient Successfully",
      data: {
        updatedDoc,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const RemovePatientFromAssignGoal = async (req, res: Response) => {
  try {
    const id = req.params.goalId;
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to add a Video",
      });
    }

    const doc = await Goals.findById(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Task not found",
      });
    }
    const tempArray = {};
    tempArray["oldData"] = doc;

    const oldPatinets = doc.patients;
    const newPatients = requestData.patients;

    for (let i = 0; i < newPatients.length; i++) {
      if (!oldPatinets.includes(newPatients[i])) {
        await doc.updateOne({ $pull: { patients: newPatients[i] } });
      }
    }

    const updatedDoc = await Goals.findById(id);

    tempArray["newData"] = requestData;

    res.status(200).json({
      status: true,
      type: "success",
      message: "Patient Removed From Goal Successfully",
      data: {
        updatedDoc,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: "error",
      status: false,
      message: error.message,
    });
  }
};

const GetGoalList = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));

    let { page, limit, sort, cond } = req.body;

    let doctorId = "";
    if (user.role_id === "doctor") {
      doctorId = user._id;
    } else {
      doctorId = "user._id";
    }

    let search = "";

    if (!page || page < 1) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }
    if (!cond) {
      cond = {};
    }
    if (!sort) {
      sort = { createdAt: -1 };
    }
    if (typeof cond.search != "undefined" && cond.search != null) {
      search = String(cond.search);
      delete cond.search;
    }

    if (user.role_id === "patient") {
      cond = [
        {
          $match: {
            isdeleted: false,
            $and: [
              cond,
              {
                $or: [{ title: { $regex: search, $options: "i" } }],
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

      const result = await Goals.aggregate(cond);

      const goals = result[0].data;
      const arr = [];
      let total;
      for (let i = 0; i < goals.length; i++) {
        const patients = goals[i].patients;
        const found = patients.find((e) => e === user._id);
        if (found != undefined) {
          arr.push(goals[i]);
          total = i;
        }
      }

      return res.status(200).json({
        status: true,
        type: "success",
        message: "Goals's Fetch Successfully",
        page: page,
        limit: limit,
        // totalPages: totalPages,
        total: result[0].total.length != 0 ? result[0].total[0].count : 0,
        data: arr,
      });
    }

    cond = [
      {
        $match: {
          isdeleted: false,
          doctorId: ObjectId(doctorId),
          $and: [
            cond,
            {
              $or: [{ title: { $regex: search, $options: "i" } }],
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

    const result = await Goals.aggregate(cond);

    let totalPages = 0;
    if (result[0].total.length != 0) {
      totalPages = Math.ceil(result[0].total[0].count / limit);
    }

    return res.status(200).json({
      status: true,
      type: "success",
      message: "Goal's Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: result[0].total.length != 0 ? result[0].total[0].count : 0,
      data: result[0].data,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const GetGoalsById = async (req, res: Response) => {
  try {
    const id = req.params.goalId;

    const result = await Goals.findById({ _id: id, isdeleted: false });

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Details Fetch Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const GetTaskById = async (req, res: Response) => {
  try {
    const id = req.params.taskId;

    const result = await Task.findById({ _id: id, isdeleted: false });

    res.status(200).json({
      status: true,
      type: "success",
      message: "Task Details Fetch Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteGoal = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.goalId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to delete a Goal",
      });
    }

    const newData = {
      isdeleted: true,
    };

    const result = await Goals.findByIdAndUpdate(
      {
        _id: id,
      },
      newData
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Deleted Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.taskId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to delete a Task",
      });
    }

    const newData = {
      isdeleted: true,
    };

    const result = await Task.findByIdAndUpdate(
      {
        _id: id,
      },
      newData
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Task Removed Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

const deleteVideo = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.videoId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to Remove Video",
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
      message: "Video Removed Successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

export default {
  CreateGoal,
  AssignVideoToTask,
  AssignGoalToPatient,
  AssignTaskToPatient,
  GetGoalList,
  GetGoalsById,
  deleteGoal,
  deleteTask,
  deleteVideo,
  RemovePatientFromAssignGoal,
  GetTaskById,
};
