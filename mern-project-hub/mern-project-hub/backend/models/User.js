import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    avatarUrl: { type: String, default: "" },
    title: { type: String, default: "" }, // e.g. "Full Stack Developer"
    bio: { type: String, default: "" },
    skills: [{ type: String }],

    // Connected accounts / integration tokens
    integrations: {
      github: {
        connected: { type: Boolean, default: false },
        username: { type: String, default: "" },
        token: { type: String, default: "" }, // stored encrypted in production
      },
      google: {
        connected: { type: Boolean, default: false },
        email: { type: String, default: "" },
        accessToken: { type: String, default: "" },
        refreshToken: { type: String, default: "" },
        expiryDate: { type: Number, default: null },
      },
    },

    settings: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      notifications: { type: Boolean, default: true },
      defaultView: { type: String, default: "dashboard" },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.integrations?.github?.token;
  delete obj.integrations?.google?.accessToken;
  delete obj.integrations?.google?.refreshToken;
  return obj;
};

export default mongoose.model("User", userSchema);
