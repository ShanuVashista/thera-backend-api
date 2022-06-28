import mongoose,{Schema,model,PopulatedDoc} from "mongoose";
import {IUser} from "./user";


export interface IGoal {
    title:string;
    goals:Array<unknown>;
    doctorId:PopulatedDoc<IUser>;
    patientId:PopulatedDoc<IUser>
}


const goalSchema = new mongoose.Schema<IGoal>(
    {
        title:{
            type:String,
            required:true
        },
        goals:{
            type:Array,
            default:null
        },
        doctorId:{
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        patientId:{
            type:Schema.Types.ObjectId,
            ref:"user"
        }
    }
)

goalSchema.virtual("doctor",{
    ref:"user",
    localField:"doctorId",
    foreignField:"_id",
    justOne:true,
})

goalSchema.virtual("patient",{
    ref:"user",
    localField:"patientId",
    foreignField:"_id",
    justOne:true,
})

const goal = model("goal",goalSchema);

export default goal;