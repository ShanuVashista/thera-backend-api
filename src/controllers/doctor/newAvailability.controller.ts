import {StatusCodes} from "http-status-codes";
import NewAvailability from "../../db/models/newAvailability.model";
import {addMinutes, eachHourOfInterval, isEqual} from 'date-fns'
import {date} from "joi";


const addAvailability = async (req,res) => {
    const data = req.body.timeslots;
    try{
        data.map((data)=>{
            const arr=[];
            let start = new Date(data.start)
            const end = new Date(data.end)
            while(!isEqual(start,end)){
                start = addMinutes(start,30);
                arr.push(start)
                console.log(start)
            }

            console.log(arr)
        });

        res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: "Availability added done",
            data:data,
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