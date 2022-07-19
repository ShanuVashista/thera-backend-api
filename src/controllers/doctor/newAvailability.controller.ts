import {StatusCodes} from "http-status-codes";
import NewAvailability from "../../db/models/newAvailability.model";
import {addMinutes, eachHourOfInterval, isEqual, subMinutes} from 'date-fns'
import {filterPaginate} from "../../lib/filterPaginate";


const addAvailability = async (req,res) => {
    const data = req.body.timeslots;
    const timeslots=[];
    try{
            data.map((data)=>{
                let start = new Date(data.start)
                const end = new Date(data.end)
                const breakStart = new Date(data.break_start)
                // const breakEnd = new Date (data.break_end)

                while(!isEqual(start,end)){
                    let isBreak= false;
                    let isActive = true;

                    start = addMinutes(start,30);

                    if(isEqual(subMinutes(start,30),breakStart)){
                        isBreak=true
                        isActive=false
                    }

                    const slot = {
                        "start":subMinutes(start,30),
                        "end":start,
                        "active":isActive,
                        "isBreak":isBreak,
                    }

                    timeslots.push(slot)
                }
                console.log(timeslots)
            });


        console.log(timeslots)
        const document ={
            timeslots,
            doctorId:req.user._id,
        }

        await NewAvailability.create(
            document
        )

        res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: "Availability added done",
            data:document,
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

const getAvailabilities = async (req,res) => {
    try{
        const {f ={}, upcoming =1} = req.query;

        const filter ={
            doctorId:req.user._id,
            ...f
        };

        if(upcoming > 0) {
            filter.end ={
                $gte: new Date()
            }
        }

        const data = await filterPaginate(NewAvailability,filter,req.query)

        if (data.total === 0) {
            return res.status(StatusCodes.OK).json({
                type: "success",
                status: true,
                message: "No availability found",
                data: { availabilities: data },
            });
        }

        res.status(StatusCodes.OK).json({
            type: "success",
            status: true,
            message: "Availability found",
            data,
        });
    }catch (err){
        console.log("Error in listing availability", err);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            type: "error",
            status: false,
            message: err.message,
        });
    }
}

export {addAvailability,getAvailabilities}