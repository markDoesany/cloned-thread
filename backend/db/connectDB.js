import mongoose from "mongoose";

export const connectDB = async () =>{
  try{
    const conn =  await mongoose.connect("mongodb+srv://smokey:TriuneGod143@threads.zuoivp0.mongodb.net/threads?retryWrites=true&w=majority&appName=threads", {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true
    })
    console.log(`MongoDB connected at ${conn.connection.host}`)
  }catch(error){
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}
