import express from "express";

const app = express();
app.use(express.json());
app.use("/");
app.listen(process.env.PORT, () => {
  console.log("the servers is running");
});
