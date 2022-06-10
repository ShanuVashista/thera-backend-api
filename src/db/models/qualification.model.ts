import { Schema, model} from "mongoose";

const qualificationSchema: Schema = new Schema(
  { 
    qualificationName :{ type: String }
  },
  {
    timestamps: true, toJSON: {
        virtuals: true
    }
}
);
const qualification = model(
  "qualification",
  qualificationSchema
);
export default qualification;
