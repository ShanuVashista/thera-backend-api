import {StatusCodes} from "http-status-codes";
import NewAvailability from "../../db/models/newAvailability.model";


const addAvailability = async (req,res) => {
    const data = req.body;
    try{
        // const availability = await NewAvailability.create({
        //     doctorId: req.user._id,
        //     _id: req.user._id,
        //     ...req.body,
        // })

        const availabilities = await NewAvailability.findOne({_id:Object(req.user._Id)});


        res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: "Availability added done",
            data:availabilities,
        });
    }catch (err){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            type: "false",
            status: false,
            message: "Something Went Wrong",
            data:err
        });
    }
}

const updateAvailability = async (req,res) =>{
    try{
        console.log("success")
    }catch(err){
        console.log(err)
    }
}

export {addAvailability}