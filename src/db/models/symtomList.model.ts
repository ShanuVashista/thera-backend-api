import mongoose from "mongoose";

export interface ISymtomList {
  specility_name?: string;
  symtom_name: string;
}

const SymtomListSchema = new mongoose.Schema(
  {
    specility_name: {
      type: String,
      minlength: 2,
      maxlength: 50,
    },
    symtom_name: { type: String, minlength: 2, maxlength: 50, required: true },
  },
  {
    timestamps: true,
  }
);

const SymtomList = mongoose.model("SymtomList", SymtomListSchema);
export default SymtomList;
