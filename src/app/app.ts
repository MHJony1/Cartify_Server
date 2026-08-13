import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { notFound } from "./middleware/notFound";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);



app.use(notFound);

app.use(globalErrorHandler);


export default app;

