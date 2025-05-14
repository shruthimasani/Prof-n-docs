const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Faculty = require("./models/Faculty");
require("dotenv").config();
const fs = require("fs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test_shruthi";

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("📡 MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Path to Excel file
const EXCEL_FILE = "test.xlsx";

// Polling interval (in ms)
const POLL_INTERVAL = 10 * 1000; // 10 seconds

// Parse Excel & return row array
const readExcel = () => {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return data;
};

// Normalize row data to match Faculty schema
const mapRowToFaculty = (row) => ({
  s_no: row["S.No."],
  faculty_unique_id: row["Faculty Unique ID"],
  title: row["Title"],
  middle_name: row["Middle Name"],
  first_name: row["First Name"],
  last_name: row["Last Name"],
  pan: row["PAN"],
  pan_first_name: row["PAN First Name"],
  pan_last_name: row["PAN Last Name"],
  current_age: row["Current Age"],
  email_address: row["Email Address"],
  designation: row["Designation"],
  department: row["Department"],
  course: row["Course"],
  gender: row["Gender"],
});

// Sync a row to Mongo (Insert or Update)
const upsertFaculty = async (facultyData) => {
  if (!facultyData.faculty_unique_id) return;

  await Faculty.findOneAndUpdate(
    { faculty_unique_id: facultyData.faculty_unique_id },
    { $set: facultyData },
    { upsert: true, new: true }
  );
};

// Sync Excel with DB
const syncExcelToMongo = async () => {
  try {
    console.log("🔄 Checking for updates...");

    const rows = readExcel();

    for (const row of rows) {
      const normalized = mapRowToFaculty(row);
      await upsertFaculty(normalized);
    }

    console.log(`✅ Synced ${rows.length} records at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.error("❌ Sync failed:", error.message);
  }
};

// Start Real-Time Polling
console.log("🚀 Real-time sync started...");
setInterval(syncExcelToMongo, POLL_INTERVAL);

// Initial run
syncExcelToMongo();
