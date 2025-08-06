// export const asyncHandeler = (requestHandeler) => async (req, res, next) => {
//   try {
//     return await requestHandeler(req, res);
//   } catch (error) {
//     console.log("ERRR from asyncHandeler please fix it");
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//     next();
//   }
// };

const asyncHandeler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandeler };
