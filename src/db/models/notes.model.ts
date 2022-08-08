
import mongoose, { PopulatedDoc, Schema ,model} from "mongoose";
import { IAppointment } from "./appointment.model";
import { IUser } from "./user";


export interface INote {
    title: string,
    text:string,
    isdeleted: boolean,
    appointmentId: PopulatedDoc<IAppointment>,
    doctorId: PopulatedDoc<IUser>,
    patientId: PopulatedDoc<IUser>,
}

const noteSchema = new mongoose.Schema<INote>({
    title:{
        type:String,
        default:"Untiled Doc",
    },
    text:{
        type:String,
    },
    doctorId:{
        type: Schema.Types.ObjectId,
        ref:"user",
    },
    appointmentId:{
        type: Schema.Types.ObjectId,
        ref:"appointments"
    },
    patientId:{
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    isdeleted:{
        type:Boolean,
        default:false,
    },
},
{ timestamps: true, toJSON: { virtuals: true } }
);


noteSchema.virtual("doctor",{
    ref:"user",
    localField:"doctorId",
    foreignField:"_id",
    justOne: true,
})

noteSchema.virtual("patient", {
    ref: "user",
    localField: "patientId",
    foreignField: "_id",
    justOne: true,
  });

  noteSchema.virtual("appointment",{
    ref:"appointments",
    localField:"appointmentId",
    foreignField:"_id",
    justOne: true,
})
  

const Note = model("note", noteSchema);


export default Note;


