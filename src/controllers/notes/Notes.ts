import { NextFunction,Request,Response } from "express";
import Note from "../../db/models/notes.model"

export interface Note{
    _id: string,
    title: string,
    text:string,
    isdeleted: boolean,
    appointmentId: string,
    doctorId:number,
    patientId: string,
}


const addNote = async (req, res:Response, next: NextFunction) =>{
    const user = JSON.parse(JSON.stringify(req.user));

    const {_id} = req.params;

    const{
        appointmentId,
        patientId,
        title,
        text
    }: Note = req.body;


    try{
        if(user.role_id != "doctor"){
            return res.status(404).json({
                status: false,
                type: "success",
                message: "You are not authorise to create a Note",
              });
        }

        
        if(_id){
            const doc = await Note.findById(_id);

            if (!doc) {
                res.status(404).json({
                    status: false,
                    message: "Note with this Id is not found",
                  });
            }


            const update = {
                text:text,
                title:title
            }
    
            await doc.updateOne(update);
    
            const updatedDoc = await Note.findById(_id)
    
            res.status(201).json({
                status: true,
                type: "success",
                data: updatedDoc,
              });
        }
           
        

        // Create a New Note
            const newNote = new Note ({
                doctorId: user._id,
                appointmentId,
                patientId,
                title,
                text
            })
    
            await newNote.save();

            res.status(201).json({
                status: true,
                type: "success",
                data: newNote,
              });
        

       

    }catch(err){
        res.status(404).json({
            status: false,
            message: "One Or More Required Field is empty",
          });
    }

}




export default {
    addNote
}