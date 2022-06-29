import Goals from "../../db/models/goals.model";
import { IUser } from "../../db/models/user";
import { Response } from "express";
import mongoose, { PopulatedDoc } from "mongoose";
const ObjectId = <any>mongoose.Types.ObjectId;

export interface IGoals {
  title: string;
  goals: Array<unknown>;
  isdeleted: boolean;
  doctorId: PopulatedDoc<IUser>;
  patients: PopulatedDoc<IUser>;
}

const CreateGoal = async (req, res: Response) => {
  const { title, goals }: IGoals = req.body;
  const user = JSON.parse(JSON.stringify(req.user));

  if (user.role_id != "doctor") {
    return res.status(404).json({
      status: false,
      type: "success",
      message: "You are not authorise to Create New Goal",
    });
  }

  try {
    const newGoal = new Goals({
      doctorId: user._id,
      title,
      goals,
    });
    await newGoal.save();

    res.status(201).json({
      status: true,
      type: "success",
      data: newGoal,
      message: "Goal Created Successfully",
    });
  } catch (Err) {
    console.log(Err);
    res.status(404).json({
      status: false,
      message: "One Or More Required Field is empty",
    });
  }
};

const GetGoals = async (req, res: Response) => {
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
    console.log("error", error);
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const GetGoalById = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const id = req.params.goalId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to get a Goal Details",
      });
    }

    const result = await Goals.findById({ _id: id });

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Details Fetch Successfully",
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

const AssignGoalToPatient = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;
    const id = req.params.goalId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to Assign the Goal",
      });
    }

    const doc = await Goals.findById(id);

    if (!doc) {
      return res.status(404).json({
        status: false,
        type: "error",
        message: "Goal not found",
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
    console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

const EditGoal = async (req, res: Response) => {
  try {
    const user = JSON.parse(JSON.stringify(req.user));
    const requestData = req.body;
    const id = req.params.goalId;

    if (user.role_id != "doctor") {
      return res.status(404).json({
        status: false,
        type: "success",
        message: "You are not authorise to Edit Goal Details",
      });
    }

    const result = await Goals.findByIdAndUpdate(
      {
        _id: id,
      },
      requestData
    );

    res.status(200).json({
      status: true,
      type: "success",
      message: "Goal Details Updated Successfully",
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

const DeleteGoal = async (req, res: Response) => {
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
    console.log("error", error);
    return res.status(400).json({
      status: false,
      type: "error",
      message: "Internal server error",
    });
  }
};

export default {
  CreateGoal,
  GetGoals,
  GetGoalById,
  AssignGoalToPatient,
  EditGoal,
  DeleteGoal,
};
