// src/routes/interaction.ts
import { Router } from "express";
import Interaction from "../models/Interaction";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/view/:productId", requireAuth, async (req: AuthRequest, res) => {
  const { productId } = req.params;
  await Interaction.create({
    userId: req.user!.userId,
    productId,
    type: "view",
  });
  res.sendStatus(201);
});

export default router;
