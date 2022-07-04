import { Schema, model } from "mongoose";

const countrySchema = new Schema(
  {
    countryCode: Object,
  },
  {
    timestamps: true,
  }
);
const Country = model("countrySchema", countrySchema);
export default Country;
