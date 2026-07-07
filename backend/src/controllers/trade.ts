import { type Request, type Response } from "express";
import Trade from "../models/trade.ts";
import { logActivity } from "../utils/activitieslog.ts";

// @desc    Create a new Trade
// @route   POST /api/trades
// @access  Private/Admin
export const createTrade = async (req: Request, res: Response) => {
  try {
    const { name, academicYear, tradeTeacher, capacity, subjects } = req.body;
    const instituteId = (req as any).instituteId;

    if (!instituteId) {
      return res.status(400).json({ message: "Institute scope is required." });
    }

    const existingTrade = await Trade.findOne({ name, academicYear, institute: instituteId });
    if (existingTrade) {
      return res.status(400).json({
        message:
          "Trade with this name already exists for the specified academic year.",
      });
    }

    const newTrade = await Trade.create({
      name,
      academicYear,
      tradeTeacher,
      capacity,
      subjects,
      institute: instituteId,
    });
    await logActivity({
      userId: (req as any).user.id,
      action: `Created new trade: ${newTrade.name}`,
    });
    await newTrade.populate("academicYear", "name");
    await newTrade.populate("tradeTeacher", "name email");
    await newTrade.populate("subjects", "name code");

    res.status(201).json(newTrade);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get All Trades
// @route   GET /api/trades
// @access  Private
export const getAllTrades = async (req: Request, res: Response) => {
  try {
    // 1. Parse Query Parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const instituteId = (req as any).instituteId;

    // 2. Build Search Query (Case-insensitive regex on Name)
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (instituteId) {
      query.institute = instituteId;
    }

    // 3. Execute Query (Count & Find)
    const [total, trades] = await Promise.all([
      Trade.countDocuments(query),
      Trade.find(query)
        .populate("academicYear", "name")
        .populate("tradeTeacher", "name email")
        .populate("subjects", "name code")
        .populate("students", "_id name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // 4. Return Data + Pagination Meta
    res.json({
      trades,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update Trade
// @route   PUT /api/trades/:id
// @access  Private/Admin
export const updateTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const instituteId = (req as any).instituteId;

    const query: any = { _id: tradeId };
    if (instituteId) {
      query.institute = instituteId;
    }

    const updatedTrade = await Trade.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("academicYear", "name")
      .populate("tradeTeacher", "name email")
      .populate("subjects", "name code");

    if (!updatedTrade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    await logActivity({
      userId: (req as any).user.id,
      action: `Updated trade: ${updatedTrade.name}`,
    });
    return res.status(200).json(updatedTrade);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete Trade
// @route   DELETE /api/trades/:id
// @access  Private/Admin
export const deleteTrade = async (req: Request, res: Response) => {
  try {
    const tradeId = req.params.id;
    const instituteId = (req as any).instituteId;

    const query: any = { _id: tradeId };
    if (instituteId) {
      query.institute = instituteId;
    }

    const deletedTrade = await Trade.findOneAndDelete(query);
    const userId = (req as any).user._id;
    await logActivity({
      userId,
      action: `Deleted trade: ${deletedTrade?.name}`,
    });
    if (!deletedTrade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    res.json({ message: "Trade removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
