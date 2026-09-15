import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://mukulsharmaworks_db_user:9ebkMpqEgAX74DIi@healthwebdev.j1mdro6.mongodb.net/?appName=HEALTHwebdev";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "patient" },
    totpSecret: { type: String, select: false },
    totpEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected:", mongoose.connection.db.databaseName);

    const admins = await User.find({ role: "admin" }).select("+passwordHash +totpSecret").lean();
    console.log(`\nFound ${admins.length} admin account(s) in collection 'users':\n`);

    admins.forEach((admin, index) => {
      console.log(`--- Admin #${index + 1} ---`);
      console.log(`ID:           ${admin._id}`);
      console.log(`Name:         ${admin.name}`);
      console.log(`Email:        ${admin.email}`);
      console.log(`Phone:        ${admin.phone || "(none)"}`);
      console.log(`Role:         ${admin.role}`);
      console.log(`2FA Enabled:  ${admin.totpEnabled}`);
      console.log(`Has 2FA Key:  ${Boolean(admin.totpSecret)}`);
      console.log(`PasswordHash: ${admin.passwordHash ? admin.passwordHash.substring(0, 20) + "..." : "MISSING"}`);
      console.log(`Created At:   ${admin.createdAt}`);
      console.log("");
    });

    const allUsersCount = await User.countDocuments();
    console.log(`Total users in database: ${allUsersCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error querying database:", err);
    process.exit(1);
  }
}

main();
