import { type Request, type Response } from "express";
import Institute from "../models/institute.ts";
import { logActivity } from "../utils/activitieslog.ts";

// @desc    Create a new Institute
// @route   POST /api/institutes
// @access  Private (Super Admin only)
export const createInstitute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, location, address, contactEmail, contactPhone, logoUrl } = req.body;

    const existingInst = await Institute.findOne({ code: code.toUpperCase() });
    if (existingInst) {
      res.status(400).json({ message: "Institute with this code already exists" });
      return;
    }

    const newInst = await Institute.create({
      name,
      code: code.toUpperCase(),
      location,
      address,
      contactEmail,
      contactPhone,
      logoUrl,
      isActive: true,
    });

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Created Institute",
        details: `Created institute: ${newInst.name} (${newInst.code})`,
      });
    }

    res.status(201).json({
      message: "Institute created successfully",
      institute: newInst,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all Institutes
// @route   GET /api/institutes
// @access  Public / Private (Super Admin gets all, others get active/own)
export const getInstitutes = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let query: any = {};

    // If not logged in, or not a super admin, only return active institutes
    if (!user || user.role !== "super_admin") {
      query.isActive = true;
    }

    const institutes = await Institute.find(query).sort({ name: 1 });
    res.json({ institutes });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update Institute
// @route   PUT /api/institutes/:id
// @access  Private (Super Admin only)
export const updateInstitute = async (req: Request, res: Response): Promise<void> => {
  try {
    const inst = await Institute.findById(req.params.id);
    if (!inst) {
      res.status(404).json({ message: "Institute not found" });
      return;
    }

    inst.name = req.body.name || inst.name;
    inst.location = req.body.location || inst.location;
    inst.address = req.body.address !== undefined ? req.body.address : inst.address;
    inst.contactEmail = req.body.contactEmail !== undefined ? req.body.contactEmail : inst.contactEmail;
    inst.contactPhone = req.body.contactPhone !== undefined ? req.body.contactPhone : inst.contactPhone;
    inst.logoUrl = req.body.logoUrl !== undefined ? req.body.logoUrl : inst.logoUrl;
    inst.isActive = req.body.isActive !== undefined ? req.body.isActive : inst.isActive;

    const updatedInst = await inst.save();

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Updated Institute",
        details: `Updated institute: ${updatedInst.name} (${updatedInst.code})`,
      });
    }

    res.json({
      message: "Institute updated successfully",
      institute: updatedInst,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
