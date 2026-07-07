import express from "express";
import {
  createTrade,
  updateTrade,
  deleteTrade,
  getAllTrades,
} from "../controllers/trade.ts";
import { authorize, protect } from "../middleware/auth.ts";

const tradeRouter = express.Router();

tradeRouter.post("/create", protect, authorize(["super_admin", "admin"]), createTrade);
tradeRouter.get("/", protect, authorize(["super_admin", "admin", "teacher"]), getAllTrades);
tradeRouter.put("/update/:id", protect, authorize(["super_admin", "admin"]), updateTrade);
tradeRouter.delete("/delete/:id", protect, authorize(["super_admin", "admin"]), deleteTrade);

export default tradeRouter;
