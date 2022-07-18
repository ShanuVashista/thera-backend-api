/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import { Roles } from "../../lib/roles";
import PaymentMethod from "./paymentMethod.model";
import { IHealthProfile } from "./healthProfile.model";

enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}
enum DoctorStatus {
  ENABLE = "enable",
  DISABLE = "disable",
}
export interface IUser {
  email: string;
  profile_photo: string;
  password: string;
  role_id: Roles;
  firstname: string;
  lastname: string;
  location?: string;
  gender: GenderEnum;
  dob: string;
  phone?: number;
  fax?: number;
  specialty?: string;
  qualification?: string;
  total_exp?: string;
  current_practise_address?: Array<unknown>;
  license?: Array<unknown>;
  healthCardNo?: string;
  healthProfileId?: mongoose.PopulatedDoc<IHealthProfile>;
  // weight?: number;
  // height?: number;
  // bmi?: number;
  // medicalCondition?: string;
  // pastMedicalCondition?: string;
  // alergies?: string;
  // medication?: string;
  // smoking?: boolean;
  // alcohol?: boolean;
  // marijuana?: boolean;
  status?: string;
  isApproved?: boolean;
  isProfessionalInfo?: boolean;
  isHealthDataInfo?: boolean;
  isBankDetails?: boolean;
  isAvailability?: boolean;
  defaultPaymentMethod?: string;
  isCorporate: boolean;
  dialCode?: string;
  currencyCode?: string;
  countryCode?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    isCorporate: {
      type: Boolean,
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Email is not a valid Email",
      },
      required: true,
    },
    healthProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "healthprofiles",
    },

    healthCardNo: {
      type: String,
    },

    profile_photo: { type: String },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!.%*?&])[A-Za-z\d@$!.%*?&]{6,}$/.test(
            value
          );
        },
        message: "{VALUE} is not a valid password",
      },
    },

    role_id: { type: String, enum: Roles, required: true },

    firstname: { type: String, required: true, minlength: 2, maxlength: 50 },

    lastname: { type: String, required: true, minlength: 2, maxlength: 50 },

    location: { type: String },

    gender: { type: String, enum: GenderEnum, required: true },

    dob: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          return validator.isDate(value, {
            format: "YYYY/MM/DD",
          });
        },
        message: "{VALUE} is not a valid date",
      },
    },

    phone: { type: Number },

    fax: { type: Number },

    specialty: { type: String },

    qualification: { type: String },

    total_exp: { type: String },

    current_practise_address: {
      type: Array,
      default: defaultByRole({
        [Roles.DOCTOR]: [
          {
            postcode: "",
            country: "",
            location: "",
            state: "",
            city: "",
            address: "",
          },
        ],
      }),
    },

    license: {
      type: Array,
      default: defaultByRole({
        [Roles.DOCTOR]: [{ authority: "", country: "", license_no: "" }],
      }),
    },
    // weight: { type: Number },
    // height: { type: Number },
    // bmi: { type: Number },
    // medicalCondition: { type: String },
    // pastMedicalCondition: { type: String },
    // alergies: { type: String },
    // medication: { type: String },
    // smoking: { type: Boolean },
    // alcohol: { type: Boolean },
    // marijuana: { type: Boolean },
    status: {
      type: String,
      enum: DoctorStatus,
      default: defaultByRole({
        [Roles.DOCTOR]: "disable",
      }),
    },
    isApproved: {
      type: mongoose.Schema.Types.Boolean,
      default: defaultByRole({
        [Roles.DOCTOR]: false,
      }),
    },
    isProfessionalInfo: {
      type: mongoose.Schema.Types.Boolean,
      default: defaultByRole({
        [Roles.DOCTOR]: false,
      }),
    },
    isHealthDataInfo: {
      type: mongoose.Schema.Types.Boolean,
      default: defaultByRole({
        [Roles.PATIENT]: false,
      }),
    },
    isBankDetails: {
      type: mongoose.Schema.Types.Boolean,
      default: defaultByRole({
        [Roles.DOCTOR]: false,
      }),
    },
    isAvailability: {
      type: mongoose.Schema.Types.Boolean,
      default: defaultByRole({
        [Roles.DOCTOR]: false,
      }),
    },
    dialCode: { type: String },
    currencyCode: { type: String },
    countryCode: { type: String },
    defaultPaymentMethod: { type: String },
  },
  {
    timestamps: true,
  }
);

// add payment method virtual
userSchema.virtual("paymentMethods", {
  ref: PaymentMethod,
  localField: "_id",
  foreignField: "userId",
});

userSchema
  .virtual("name")
  .get(function (this: mongoose.HydratedDocument<IUser>) {
    return `${this.firstname} ${this.lastname}`;
  });

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

userSchema.pre("save", function (this: mongoose.HydratedDocument<IUser>, next) {
  const user = this;
  // console.log(user);
  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });

  user.email = user.email.toLowerCase();
});

userSchema.methods.toJSON = function (this: mongoose.HydratedDocument<IUser>) {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.methods.comparePassword = function (
  this: mongoose.HydratedDocument<IUser>,
  password
) {
  const user = this;

  return bcrypt.compareSync(password, user.password);
};
const User = mongoose.model("user", userSchema);
export default User;

function defaultByRole<T>(roleDefault: { [key in Roles]?: T } = {}) {
  return function (this: IUser): T | undefined {
    return roleDefault[this.role_id];
  };
}
