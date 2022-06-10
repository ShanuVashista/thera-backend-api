/* eslint-disable no-useless-escape */
// import { existsSync, mkdirSync, renameSync } from "fs";
import qualificationModel from '../../db/models/qualification.model';

const qualification = async (req, res) => {
    try {
        if (req.user.role_id != 'doctor') {
           return res.status(400).json({
              status: false,
              type: "Error",
              message: "You Are Not Authorized User "
            })
          }
        let data = await qualificationModel.find();

        res.status(201).json({
            status: true,
            type: 'success',
            message: 'Qualification List Get Successfully',
            data: data
        });
    } catch (error) {
            res.status(400).json({
                status: false,
                type: 'error',
                message: error.message
            });
    }
}
export default qualification