import { IUser } from "./user";
import { ISymtomList } from "./symtomList.model";
import { Schema, model, PopulatedDoc } from "mongoose";

export interface ISymtoms {
  userId: PopulatedDoc<IUser>;
  symtomId: PopulatedDoc<ISymtomList>;
}

const SymtomsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    symtomId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "SymtomList",
    },
  },
  {
    timestamps: true,
  }
);

const Symtoms = model("Symtoms", SymtomsSchema);
export default Symtoms;
