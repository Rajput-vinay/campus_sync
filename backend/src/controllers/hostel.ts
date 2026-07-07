import { type Request, type Response } from "express";
import axios from "axios";
import HostelApplication from "../models/hostel.ts";
import User from "../models/user.ts";
import Room from "../models/room.ts";
import Maintenance from "../models/maintenance.ts";
import { sendEmail } from "../utils/sendEmail.ts";
import { logActivity } from "../utils/activitieslog.ts";
import HostelBuilding from "../models/hostelBuilding.ts";

// 🔹 NSTI Kanpur Coordinates
const NSTI = {
  lat: 26.4499,
  lon: 80.3319,
};

// 🔹 Simple in-memory cache (use DB/Redis in real apps)
const pincodeCache = new Map<string, { lat: number; lng: number }>();

// 🔹 Get Lat/Lng from OpenCage
const getLatLngFromPincode = async (pincode: string) => {
  if (pincodeCache.has(pincode)) {
    return pincodeCache.get(pincode)!;
  }

  const res = await axios.get("https://api.positionstack.com/v1/forward", {
    params: {
      query: pincode,
      access_key: process.env.POSITIONSTACK_API_KEY?.trim(),
      country: "IN",
    },
  });

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error("Invalid pincode or no location found");
  }

  const { latitude, longitude } = res.data.data[0];

  const result = { lat: latitude, lng: longitude };

  pincodeCache.set(pincode, result);

  return result;
};

// 🔹 Haversine Formula (accurate distance in KM)
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// @desc    Submit Hostel Application (Student)
// @route   POST /api/hostel/apply
export const applyForHostel = async (req: Request, res: Response) => {
  try {
    const { fatherName, address, pincode, trade, citsNumber, isPwD, hostelChoice } = req.body;
    const studentId = (req as any).user._id;
    const instituteId = (req as any).instituteId;

    // ❌ Check duplicate
    const existing = await HostelApplication.findOne({ student: studentId });
    if (existing) {
      return res.status(400).json({
        message: "You have already submitted a hostel application",
      });
    }

    // 🔹 Get coordinates
    const { lat, lng } = await getLatLngFromPincode(pincode);

    // 🔹 Calculate real distance
    const distance =
      Math.round(haversine(NSTI.lat, NSTI.lon, lat, lng) * 10) / 10; // 1 decimal

    // 🔹 Save application
    const application = await HostelApplication.create({
      student: studentId,
      fatherName,
      address,
      pincode,
      trade,
      citsNumber,
      distance,
      isPwD: !!isPwD,
      location: { lat, lng },
      hostelChoice: hostelChoice || undefined,
      institute: instituteId,
    });

    // 🔹 Log activity
    await logActivity({
      userId: studentId,
      action: "Applied for Hostel",
      details: `CITS: ${citsNumber}, Distance: ${distance}km`,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error: any) {
    if (error.response) {
      console.error("PositionStack API Error:", error.response.data);
      return res.status(error.response.status).json({
        message: `Location service error: ${error.response.data.status?.message || error.message}`,
      });
    }

    console.error("Hostel Apply Error:", error.message);
    res.status(500).json({
      message:
        error.message || "Something went wrong while applying for hostel",
    });
  }
};

// @desc    Get Hostel Applications (Admin)
// @route   GET /api/hostel/applications
export const getApplications = async (req: Request, res: Response) => {
  try {
    const { status, trade, minDistance, maxDistance, isPwD } = req.query;
    const query: any = {};

    const instituteId = (req as any).instituteId;
    if (instituteId) {
      query.institute = instituteId;
    }

    if (status) query.status = status;
    if (trade) query.trade = trade;
    if (isPwD === "true") query.isPwD = true;
    if (isPwD === "false") query.isPwD = false;

    if (minDistance || maxDistance) {
      query.distance = {};
      if (minDistance) query.distance.$gte = Number(minDistance);
      if (maxDistance) query.distance.$lte = Number(maxDistance);
    }

    const applications = await HostelApplication.find(query)
      .populate("student", "name email")
      .populate("hostelChoice", "name category")
      .sort({ isPwD: -1, distance: -1, createdAt: 1 }); // PwD first, then highest distance first

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Application Status (Admin)
// @route   PUT /api/hostel/status
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { ids, status } = req.body; // ids is an array for bulk update

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid application IDs" });
    }

    const instituteId = (req as any).instituteId;
    const query: any = { _id: { $in: ids } };
    if (instituteId) {
      query.institute = instituteId;
    }

    const applications = await HostelApplication.find(query).populate("student", "name email");

    for (const app of applications) {
      if (status === "approved" && app.status !== "approved") {
        // Find an available room
        let room;

        if (app.isPwD) {
          // 🔹 PwD Priority: Try to find a room on the ground floor (floor 0)
          // Try to match preferred hostel first if set
          if (app.hostelChoice) {
            room = await Room.findOne({ floor: 0, status: "available", hostel: app.hostelChoice });
          }
          // If not found, try ground floor in any hostel
          if (!room) {
            room = await Room.findOne({ floor: 0, status: "available" });
          }
          // If still not found, try preferred hostel (any floor)
          if (!room && app.hostelChoice) {
            room = await Room.findOne({ status: "available", hostel: app.hostelChoice });
          }
          // If still not found, fallback to any available room
          if (!room) {
            room = await Room.findOne({ status: "available" });
          }
        } else {
          // Regular allotment: try preferred hostel first if set
          if (app.hostelChoice) {
            room = await Room.findOne({ status: "available", hostel: app.hostelChoice });
          }
          if (!room) {
            room = await Room.findOne({ status: "available" });
          }
        }

        if (room) {
          app.room = room._id as any;
          room.occupants.push(app.student as any);
          if (room.occupants.length >= room.capacity) {
            room.status = "full";
          }
          await room.save();
        } else {
          console.warn(
            "No rooms available for student",
            (app.student as any).name,
          );
        }
      }

      app.status = status;
      app.processedAt = new Date();
      await app.save();

      // Send email notification
      if (status === "approved" || status === "rejected") {
        try {
          const roomInfo = app.room ? await Room.findById(app.room) : null;
          const statusText = status.charAt(0).toUpperCase() + status.slice(1);

          let emailMessage = `Dear ${(app.student as any).name},\n\n`;
          emailMessage += `We are writing to inform you that your hostel application at **NSTI Kanpur** has been **${statusText}**.\n\n`;

          if (status === "approved") {
            emailMessage += `Congratulations! You have been allotted a room in the institute hostel.\n\n`;
            if (roomInfo) {
              emailMessage += `**Allotted Room Details:**\n`;
              emailMessage += `- **Room Number:** ${roomInfo.roomNumber}\n`;
              emailMessage += `- **Block:** ${roomInfo.block}\n`;
              emailMessage += `- **Floor:** ${roomInfo.floor}\n\n`;
            }
            emailMessage += `**Next Steps:**\n`;
            emailMessage += `1. Please visit the Hostel Office within the next 3 working days.\n`;
            emailMessage += `2. Bring your admission slip and 2 passport-size photographs.\n`;
            emailMessage += `3. Complete the remaining formalities and collect your room keys.\n`;
          } else {
            emailMessage += `We regret to inform you that we are currently unable to allot you a room due to high demand and limited availability. Your application has been moved to the waiting list.\n\n`;
            emailMessage += `We will notify you immediately if a vacancy becomes available in your trade category.\n`;
          }

          emailMessage += `\nBest regards,\n**Hostel Administration**\nNSTI Kanpur Portal`;

          await sendEmail({
            email: (app.student as any).email,
            subject: `Hostel Allotment Status: ${statusText} - NSTI KANPUR`,
            message: emailMessage,
          });
        } catch (emailErr) {
          console.error(
            "Hostel status email failed for",
            (app.student as any).email,
            emailErr,
          );
        }
      }
    }

    await logActivity({
      userId: (req as any).user._id,
      action: "Updated Hostel Status",
      details: `${ids.length} applications ${status}`,
    });

    res.json({ message: `Successfully ${status} ${ids.length} applications` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get My Application (Student)
// @route   GET /api/hostel/my-application
export const getMyApplication = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user._id;
    const application = await HostelApplication.findOne({
      student: studentId,
    }).populate("room").populate("hostelChoice", "name category");
    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Rooms (Admin)
// @route   GET /api/hostel/rooms
export const getRooms = async (req: Request, res: Response) => {
  try {
    const { floor, hostelId } = req.query;
    const instituteId = (req as any).instituteId;
    const query: any = { institute: instituteId };

    if (floor !== undefined && floor !== "") {
      query.floor = Number(floor);
    }

    if (hostelId !== undefined && hostelId !== "") {
      query.hostel = hostelId;
    }

    const rooms = await Room.find(query)
      .populate("occupants", "name trade")
      .populate("hostel", "name category")
      .sort({ floor: 1, roomNumber: 1 }); // Floor 0 first, then sequential room numbers

    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Room (Admin)
// @route   POST /api/hostel/rooms
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { roomNumber, floor, block, capacity, hostel } = req.body;
    const instituteId = (req as any).instituteId;
    const room = await Room.create({
      roomNumber,
      floor,
      block,
      capacity,
      hostel,
      institute: instituteId,
    });
    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit Maintenance Request (Student)
// @route   POST /api/hostel/maintenance
export const submitMaintenance = async (req: Request, res: Response) => {
  try {
    const { issueType, description, priority } = req.body;
    const studentId = (req as any).user._id;

    // Find student's application to get room
    const application = await HostelApplication.findOne({
      student: studentId,
      status: "approved",
    });
    if (!application || !application.room) {
      return res
        .status(400)
        .json({ message: "You don't have an allotted room" });
    }

    const maintenance = await Maintenance.create({
      student: studentId,
      room: application.room,
      issueType,
      description,
      priority,
      institute: application.institute || (req as any).instituteId,
    });

    await logActivity({
      userId: studentId,
      action: "Submitted Maintenance Request",
      details: `${issueType}: ${description.substring(0, 30)}...`,
    });

    res.status(201).json(maintenance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Maintenance Requests (Admin/Student)
// @route   GET /api/hostel/maintenance
export const getMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const instituteId = (req as any).instituteId;
    let query: any = {};

    if (user.role === "student") {
      query = { student: user._id };
    } else {
      if (instituteId) {
        query.institute = instituteId;
      }
    }

    const requests = await Maintenance.find(query)
      .populate("student", "name trade")
      .populate("room", "roomNumber block")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Maintenance Status (Admin)
// @route   PUT /api/hostel/maintenance/:id
export const updateMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminComments } = req.body;

    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      return res.status(404).json({ message: "Request not found" });
    }

    maintenance.status = status;
    if (adminComments) {
      maintenance.adminComments = adminComments;
    }

    if (status === "resolved") {
      maintenance.resolvedAt = new Date();
    }
    await maintenance.save();

    res.json(maintenance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Hostels
// @route   GET /api/hostel/hostels
export const getHostels = async (req: Request, res: Response) => {
  try {
    const instituteId = (req as any).instituteId;
    const hostels = await HostelBuilding.find({ institute: instituteId }).sort({
      name: 1,
    });
    res.json(hostels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Hostel Building
// @route   POST /api/hostel/hostels
export const createHostel = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;

    const instituteId = (req as any).instituteId;
    console.log("instituteId", instituteId);

    const existingHostel = await HostelBuilding.findOne({
      name,
      institute: instituteId,
    });
    if (existingHostel) {
      return res
        .status(400)
        .json({
          message: "Hostel with this name already exists in the institute",
        });
    }

    const hostel = await HostelBuilding.create({
      name,
      category,
      institute: instituteId,
    });

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Created Hostel Building",
        details: `Created hostel: ${hostel.name} (${hostel.category})`,
        institute: instituteId,
      });
    }

    res.status(201).json(hostel);
  } catch (error: any) {
    res.status(500).json({ message: error.message,error:"heere from here" });
  }
};

// @desc    Update Hostel Building
// @route   PUT /api/hostel/hostels/:id
export const updateHostel = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    const hostel = await HostelBuilding.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const instituteId = (req as any).instituteId;
    if (name && name !== hostel.name) {
      const existingHostel = await HostelBuilding.findOne({
        name,
        institute: instituteId,
      });
      if (existingHostel) {
        return res
          .status(400)
          .json({
            message: "Hostel with this name already exists in the institute",
          });
      }
      hostel.name = name;
    }

    if (category) {
      hostel.category = category;
    }

    const updatedHostel = await hostel.save();

    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Updated Hostel Building",
        details: `Updated hostel: ${updatedHostel.name} (${updatedHostel.category})`,
        institute: instituteId,
      });
    }

    res.json(updatedHostel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Hostel Building
// @route   DELETE /api/hostel/hostels/:id
export const deleteHostel = async (req: Request, res: Response) => {
  try {
    const hostel = await HostelBuilding.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Check if there are rooms associated with this hostel
    const roomsCount = await Room.countDocuments({ hostel: hostel._id });
    if (roomsCount > 0) {
      return res
        .status(400)
        .json({
          message:
            "Cannot delete hostel as there are active rooms associated with it",
        });
    }

    await hostel.deleteOne();

    const instituteId = (req as any).instituteId;
    if ((req as any).user) {
      await logActivity({
        userId: (req as any).user._id,
        action: "Deleted Hostel Building",
        details: `Deleted hostel: ${hostel.name}`,
        institute: instituteId,
      });
    }

    res.json({ message: "Hostel deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
