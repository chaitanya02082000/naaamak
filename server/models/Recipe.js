import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    prepTime: {
      type: String,
      default: "",
    },
    cookTime: {
      type: String,
      default: "",
    },
    totalTime: {
      type: String,
      default: "",
    },
    yield: {
      type: String,
      default: "",
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [Object],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    cuisine: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", RecipeSchema);

export default Recipe; 