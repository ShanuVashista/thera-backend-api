import mongoose from "mongoose";
import {
  OrganizationStatuses,
  OrganizationTypes,
} from "../../lib/organizationEnum";

export interface IOrganization {
  name: string;
  type: OrganizationTypes;
  location: {
    address: string;
    city: string;
    country: string;
  };
  contact_person?: {
    name: string;
    email?: string;
    phone?: string;
  };
  status: OrganizationStatuses;
}

const OrganizationSchema = new mongoose.Schema<IOrganization>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: OrganizationTypes, required: true },
    location: { type: Object, required: true },
    contact_person: { type: Object },
    status: {
      type: String,
      enum: OrganizationStatuses,
      default: OrganizationStatuses.INACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model("organization", OrganizationSchema);
export default Organization;
