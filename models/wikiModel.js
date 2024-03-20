const mongoose = require("mongoose");

const WikiSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    unique: true,
    minlength: 3,
    maxlength: 20,
  },
  content: {
    type: String,
    required: [true, "Please provide a content"],
    minlength: 3,
  },
  author: {
    type: String,
    required: [true, "Please provide author name"],
    minlength: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Wiki = mongoose.model("Wiki", WikiSchema)

module.exports = Wiki