import jwt from "jsonwebtoken";

export function createToken(user) {
  return jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}
