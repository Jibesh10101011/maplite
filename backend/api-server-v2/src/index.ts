import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./database";

const PORT = process.env.PORT!;

const startServer = async() => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch(error) {
    console.log("MONGO db connection failed !!! ", error);
    process.exit(1);
  }
};

startServer();

