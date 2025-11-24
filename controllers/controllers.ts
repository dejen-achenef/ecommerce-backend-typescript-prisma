import { router } from "../routes/routes.js";
import { createUser } from "../functions/routeFucntions";

router.post("/auth/register", createUser);
