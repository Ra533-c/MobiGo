import dotenv from "dotenv";
import express from "express"
import cors from "cors"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.listen(process.env.PORT,()=>{
    console.log(`Realtime service is running on port ${process.env.PORT}`)
});