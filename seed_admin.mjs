import mongoose from "mongoose";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "admin"], default: "patient" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/healthtech";
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected to database:", mongoose.connection.db.databaseName);

    const email = "mukul@test.com";
    const password = "1234567890";
    const phone = "1234567890";
    const name = "Mukul (Admin)";

    let user = await User.findOne({ email });

    const passwordHash = await hashPassword(password);

    if (user) {
      user.role = "admin";
      user.passwordHash = passwordHash;
      user.phone = phone;
      user.name = name;
      await user.save();
      console.log("✅ Admin account mukul@test.com updated with admin role and password '1234567890'!");
    } else {
      user = await User.create({
        name,
        email,
        phone,
        passwordHash,
        role: "admin",
      });
      console.log("✅ Admin account mukul@test.com created successfully with role 'admin'!");
    }

    console.log("User details:", {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin user:", err);
    process.exit(1);
  }
}

main();
