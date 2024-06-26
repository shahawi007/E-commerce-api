const appError = require("../utils/appError");
const { CastError } = require("mongoose");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new appError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  console.log(value);
  const message = `Duplicate field value: ${value}. Use another value.`;
  return new appError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join(" . ")} `;
  return new appError(message, 400);
};

const sendErrorprod = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR !!", err);

    res.status(500).json({
      status: "Error",
      message: "Something went very wrong!",
    });
  }
};

const handleJWTError = (err) =>
  new appError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = (err) =>
  new appError("Your token has expired! Please log in again.", 401);

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handling specific error types
  if (err instanceof CastError) {
    err = handleCastErrorDB(err);
  }
  if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  }
  if (err.name === "ValidationError") {
    err = handleValidationErrorDB(err);
  }
  if (err.name === "JsonWebTokenError") {
    err = handleJWTError(err);
  }
  if (err.name === "TokenExpiredError") {
    err = handleJWTExpiredError(err);
  }

  sendErrorprod(err, res);
};

module.exports = errorHandler;
