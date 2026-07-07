import ActivitiesLog from "../models/activitieslog.ts";

export const logActivity = async ({
  userId,
  action,
  details,
  institute,
}: {
  userId: string;
  action: string;
  details?: string;
  institute?: string;
}) => {
  try {
    await ActivitiesLog.create({
      user: userId,
      action,
      details,
      institute,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
