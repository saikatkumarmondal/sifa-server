const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },

    password: {
      type: String,
      required: true,
      validate(value) {
        if (
          !validator.isStrongPassword(value, { minLength: 6, minSymbols: 0 })
        ) {
          throw new Error(
            "Password must be stronger (min 6 chars, include numbers & letters)"
          );
        }
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    image: {
      type: String,
      default:
        "https://odoo-community.org/web/image/product.template/3936/image_1024?unique=3734afe",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
