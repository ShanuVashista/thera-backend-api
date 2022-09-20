/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
// import jwt from "jsonwebtoken";
import StatusCodes from "http-status-codes";
import User from "../../db/models/user";

const List_User = async (req, res) => {
  try {
    // if (typeof (cond.role_id) != 'undefined' && cond.role_id != null) {
    //     cond = [
    //         { $addFields: { phonestr: { $toString: '$phone' } } },
    //         {
    //             $match: {
    //                 $and: [{ "role_id": cond.role_id }, {
    //                     $or: [
    //                         { "email": { $regex: cond.search } },
    //                         { "firstname": { $regex: cond.search } },
    //                         { "lastname": { $regex: cond.search } },
    //                         { "phonestr": { $regex: cond.search } },
    //                     ]
    //                 }]
    //             }
    //         },
    //         { $project: { "phonestr": 0 } },
    //         { $sort: sort },
    //         {
    //             $facet: {
    //                 data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
    //                 total: [
    //                     {
    //                         $count: 'count'
    //                     }
    //                 ]
    //             }
    //         }
    //     ]
    // } else {
    //     cond = [
    //         { $addFields: { phonestr: { $toString: '$phone' } } },
    //         {
    //             $match: {
    //                 $or: [
    //                     { "email": { $regex: cond.search } },
    //                     { "firstname": { $regex: cond.search } },
    //                     { "lastname": { $regex: cond.search } },
    //                     { "phonestr": { $regex: cond.search } },
    //                 ]
    //             }
    //         },
    //         { $project: { "phonestr": 0 } },
    //         { $sort: sort },
    //         {
    //             $facet: {
    //                 data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
    //                 total: [
    //                     {
    //                         $count: 'count'
    //                     }
    //                 ]
    //             }
    //         }
    //     ]
    // }
    // if (typeof (cond.role_id) != 'undefined' && cond.role_id != null) {
    //     cond = [
    //         {
    //             $match: {
    //                 $and: [{ "role_id": cond.role_id }, {
    //                     $or: [
    //                         { "email": { $regex: cond.search, '$options' : 'i' } },
    //                         { "firstname": { $regex: cond.search, '$options' : 'i' } },
    //                         { "lastname": { $regex: cond.search, '$options' : 'i' } },
    //                     ]
    //                 }]
    //             }
    //         },
    //         { $sort: sort },
    //         {
    //             $facet: {
    //                 data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
    //                 total: [
    //                     {
    //                         $count: 'count'
    //                     }
    //                 ]
    //             }
    //         }
    //     ]
    // } else {
    //     cond = [
    //         {
    //             $match: {
    //                 $or: [
    //                     { "email": { $regex: cond.search, '$options' : 'i' } },
    //                     { "firstname": { $regex: cond.search, '$options' : 'i' } },
    //                     { "lastname": { $regex: cond.search, '$options' : 'i' } },
    //                 ]
    //             }
    //         },
    //         { $sort: sort },
    //         {
    //             $facet: {
    //                 data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
    //                 total: [
    //                     {
    //                         $count: 'count'
    //                     }
    //                 ]
    //             }
    //         }
    //     ]
    // }

    // if (req.user.role_id == "admin") {
    let { page, limit, sort, cond } = req.body;
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      search = String(cond.search);
      delete cond.search;
    }

    cond = [
      {
        $match: {
          $and: [
            cond,
            {
              $or: [
                { email: { $regex: search, $options: "i" } },
                { firstname: { $regex: search, $options: "i" } },
                { fullname: { $regex: search, $options: "i" } },
                { lastname: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
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
    let user = await User.aggregate(cond);
    user = JSON.parse(JSON.stringify(user));

    // user.forEach(oneUser => oneUser.populate('paymentMethods'))
    let totalPages = 0;
    if (user[0].total.length != 0) {
      totalPages = Math.ceil(user[0].total[0].count / limit);
    }
    res.status(StatusCodes.OK).send({
      status: true,
      type: "success",
      message: "User List Fetch Successfully",
      page: page,
      limit: limit,
      totalPages: totalPages,
      total: user[0].total.length != 0 ? user[0].total[0].count : 0,
      data: user[0].data,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      type: "error",
      message: error.message,
    });
  }
};

export default List_User;
