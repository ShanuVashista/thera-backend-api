/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

export async function filterPaginate(
  Model: mongoose.Model<any>,
  filter: { [key: string]: any } = {},
  {
    page = 1,
    limit = 10,
    sort = "createdAt",
  }: {
    page: number;
    limit: number;
    sort: string | string[];
  }
) {
  const docs = await Model.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(typeof sort === "string" ? sort : sort.join(" "));

  const total = await Model.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);

  return { docs, total, totalPages, page: +page, limit: +limit, sort };
}
