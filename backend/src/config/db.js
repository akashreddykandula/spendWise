import mongoose from 'mongoose'; // 👈 THIS LINE IS REQUIRED

const connectDB = async () => {
  try {
    console.log ('MONGO_URI:', process.env.MONGO_URI); // debug
    await mongoose.connect (process.env.MONGO_URI);
    console.log ('MongoDB connected 👍');
  } catch (err) {
    console.error (err.message);
    process.exit (1);
  }
};
export default connectDB; // 👈 MUST be default export
