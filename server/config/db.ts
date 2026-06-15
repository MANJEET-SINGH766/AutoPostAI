import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on("connected",async ()=>{
            console.log("MongoDB connected successfully");

        })
        await mongoose.connect(process.env.MONGODB_URI!);
    }
    catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}
export default connectDB;
