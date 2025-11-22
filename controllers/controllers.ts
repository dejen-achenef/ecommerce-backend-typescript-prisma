import express from "express";
import { createUser } from "../functions/routeFucntions";
const router = express.Router();

router.post("/auth/register", createUser);
