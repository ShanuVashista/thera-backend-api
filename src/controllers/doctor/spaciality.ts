/* eslint-disable no-useless-escape */
// import { existsSync, mkdirSync, renameSync } from "fs";
import spacialityModel from '../../db/models/spaciality.model';

const spaciality = async (req, res) => {
    try {
        if (req.user.role_id != 'doctor') {
            return res.status(400).json({
               status: false,
               type: "Error",
               message: "You Are Not Authorized For User"
             })
           }
         let data = await spacialityModel.find();
 
        res.status(201).json({
            status: true,
            type: 'success',
            message: 'Spaciality List Get Successfully',
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
export default spaciality