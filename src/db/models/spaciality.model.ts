import { Schema, model} from "mongoose";

const spacialitySchema: Schema = new Schema(
  { 
    spacialityName :{ type: String }
  },
  {
    timestamps: true, toJSON: {
        virtuals: true
    }
}
);
const spaciality = model(
  "spaciality",
  spacialitySchema
);
export default spaciality;
