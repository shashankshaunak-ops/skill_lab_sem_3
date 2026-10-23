import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "The requested endpoint was not found." });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({ message: "The request body contains invalid JSON." });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({
      message: error.issues[0]?.message ?? "The submitted data is invalid.",
    });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ message: "The supplied identifier is invalid." });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ message: "The submitted data is invalid." });
    return;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    response.status(409).json({ message: "An account with that email already exists." });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "An unexpected server error occurred." });
};
