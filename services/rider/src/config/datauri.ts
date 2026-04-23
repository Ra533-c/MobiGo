import DataUriParser from "datauri/parser.js";
import { parse } from "dotenv";
import path from "path";

const getBuffer = (file: any) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  console.log("extName for file :", extName);
  return parser.format(extName, file.buffer);
};

export default getBuffer; //this is the file buffer with extName
