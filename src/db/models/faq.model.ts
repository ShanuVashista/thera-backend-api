import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, minlength: 2, maxlength: 500 },
    answer: { type: String, required: true, minlength: 2, maxlength: 5000 },
  },
  {
    timestamps: true,
  }
);

const Faq = mongoose.model("faq", faqSchema);
export default Faq;
