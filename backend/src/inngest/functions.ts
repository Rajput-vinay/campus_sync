import type _trade from "../models/trade.ts";
import { inngest } from "./index.ts";
import Trade from "../models/trade.ts";
import User from "../models/user.ts";
import Timetable from "../models/timetable.ts";
import Exam from "../models/exam.ts";
import Submission from "../models/submission.ts";

import { NonRetriableError } from "inngest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

interface GenSettings {
  startTime: string;
  endTime: string;
  periods: number;
}

// Your new function:
export const generateTimeTable = inngest.createFunction(
  { id: "Generate-Timetable" },
  { event: "generate/timetable" }, //name
  async ({ event, step }) => {
    const { tradeId, academicYearId, settings } = event.data as {
      tradeId: string;
      academicYearId: string;
      settings: GenSettings;
    };

    const contextData = await step.run("fetch-trade-context", async () => {
      // fetch trade and populate subjects & their teachers
      const tradeData = await Trade.findById(tradeId).populate({
        path: "subjects",
        populate: { path: "teacher", select: "name _id" }
      });
      if (!tradeData) throw new NonRetriableError("Trade not found");

      const subjectsPayload = tradeData.subjects.map((sub: any) => ({
        id: sub._id,
        name: sub.name,
        code: sub.code,
        type: sub.type,
        assignedTeacherId: sub.teacher ? sub.teacher._id : null,
        assignedTeacherName: sub.teacher ? sub.teacher.name : "Unassigned",
      }));

      // here we should check if we have subjects
      if (subjectsPayload.length === 0)
        throw new NonRetriableError("No Subjects assigned to this trade");

      // Ensure every subject has a teacher
      const unassigned = subjectsPayload.find((s: any) => !s.assignedTeacherId);
      if (unassigned) {
         throw new NonRetriableError(`Subject ${unassigned.name} has no teacher assigned`);
      }

      return {
        tradeName: tradeData.name,
        subjects: subjectsPayload,
        institute: tradeData.institute,
      };
    });

    // generate timetable logic would go here
    const aiSchedule = await step.run("generate-timetable-logic", async () => {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new NonRetriableError("GOOGLE_GENERATIVE_AI_API_KEY is missing");
      }

      const allTimetables = await Timetable.find({
        academicYear: academicYearId,
      });

      const prompt = `
        You are a school scheduler. Generate a weekly timetable (Monday to Friday).

        CONTEXT:
        - Trade: ${contextData.tradeName}
        - Hours: ${settings.startTime} to ${settings.endTime} (${
        settings.periods
      } periods/day).

        RESOURCES:
        - Subjects: ${JSON.stringify(contextData.subjects)}
        - Other Timetables: ${JSON.stringify(allTimetables)}

        STRICT RULES:
        1. For each period, you MUST use the exact "assignedTeacherId" specified in the Subjects list for that subject.
        2. For the "subject" field, you MUST use the exact "id" from the Subjects list. DO NOT use placeholder strings. Map the subject's "type" to the corresponding block below.
        3. Time Slots MUST strictly follow this exact structure for every day (Monday to Friday):
           - Block A (practical type): 09:00 to 13:00
           - Block B (theory type): 13:30 to 15:30
           - Block C (methodology type or other): 15:30 to 17:00
           *Note: 13:00 to 13:30 is Lunch Break and should NOT be included in the schedule periods.*
        4. Avoid clashes with other trades (teacher can't be in two trades at the same time).
        5. Output strict JSON only. Schema:
           {
             "schedule": [
               {
                 "day": "Monday",
                 "periods": [
                   { "subject": "EXACT_SUBJECT_ID", "teacher": "EXACT_TEACHER_ID", "startTime": "09:00", "endTime": "13:00" },
                   { "subject": "EXACT_SUBJECT_ID", "teacher": "EXACT_TEACHER_ID", "startTime": "13:30", "endTime": "15:30" },
                   { "subject": "EXACT_SUBJECT_ID", "teacher": "EXACT_TEACHER_ID", "startTime": "15:30", "endTime": "17:00" }
                 ]
               }
             ]
           }
      `;

      const google = createGoogleGenerativeAI({
        apiKey,
      });

      // I will show you how to get one if these does not work for you
      const activeModel = google("gemini-2.5-flash");

      const { text } = await generateText({
        prompt,
        model: activeModel,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) throw new NonRetriableError("Invalid AI response format");
      const parsed = JSON.parse(jsonMatch[0]);
      
      // If the AI returned the schedule array directly instead of wrapping it in an object
      if (Array.isArray(parsed)) {
        return { schedule: parsed };
      }
      // If it returned the object but missing the 'schedule' wrapper somehow
      if (parsed.day && parsed.periods) {
         return { schedule: [parsed] };
      }
      return parsed;
    });
    // now let save
    await step.run("save-timetable", async () => {
      // Delete existing to avoid duplicates
      // we should also delete any timetable assigned or generate for this trade
      await Timetable.findOneAndDelete({
        trade: tradeId,
        academicYear: academicYearId,
      });
      await Timetable.create({
        trade: tradeId,
        academicYear: academicYearId,
        schedule: aiSchedule.schedule,
        institute: contextData.institute,
      });

      return { success: true, tradeId };
    });
    return { message: "Timetable generated successfully" };
  }
);

// Your new function:
export const generateExam = inngest.createFunction(
  { id: "Generate-Exam" },
  { event: "exam/generate" }, //name
  async ({ event, step }) => {
    const { examId, topic, subjectName, difficulty, count } = event.data;

    // generate timetable logic would go here
    const aiExam = await step.run("generate-exam-logic", async () => {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new NonRetriableError("GOOGLE_GENERATIVE_AI_API_KEY is missing");
      }

      const prompt = `
        You are a strict teacher. Create a JSON array of ${count} multiple-choice questions for a high school exam.

        CONTEXT:
        - Subject: ${subjectName}
        - Topic: ${topic}
        - Difficulty: ${difficulty}

        STRICT JSON SCHEMA (Array of Objects):
        [
          {
            "questionText": "Question string",
            "type": "MCQ",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The exact string of the correct option",
            "points": 1
          }
        ]

        RULES:
        1. Output ONLY raw JSON. No Markdown.
        2. Ensure correct answer matches one of the options exactly.
      `;

      const google = createGoogleGenerativeAI({
        apiKey,
      });

      // I will show you how to get one if these does not work for you
      const activeModel = google("gemini-2.5-flash");

      const { text } = await generateText({
        prompt,
        model: activeModel,
      });

      // Sanitize JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new NonRetriableError("Invalid AI response format");
      return JSON.parse(jsonMatch[0]);
    });
    // now let save
    await step.run("save-exam", async () => {
      const exam = await Exam.findById(examId);

      if (!exam) {
        throw new NonRetriableError(`Exam ${examId} not found`);
      }

      // Update the exam with the new questions
      exam.questions = aiExam;
      exam.isActive = false; // Keep it inactive until teacher reviews it

      await exam.save();

      return { success: true, count: aiExam.length };
    });
    return { message: "Exam generated successfully" };
  }
);

// handle submission inside inngest
// Important because we don't want the student's submission to be have issues
// with server timeouts or other problems
export const handleExamSubmission = inngest.createFunction(
  { id: "Handle-Exam-Submission" },
  { event: "exam/submit" }, //name
  async ({ event, step }) => {
    const { examId, studentId, answers } = event.data;

    await step.run("process-exam-submission", async () => {
      // 1. Check if already submitted
      const existingSubmission = await Submission.findOne({
        exam: examId,
        student: studentId,
      });
      if (existingSubmission) {
        throw new NonRetriableError("Exam already submitted");
      }

      // 2. Fetch full exam (with answers)
      const exam = await Exam.findById(examId).select(
        "+questions.correctAnswer"
      );
      if (!exam) {
        throw new NonRetriableError(`Exam ${examId} not found`);
      }

      // 3. Calculate Score
      let score = 0;
      let totalPoints = 0;

      exam.questions.forEach((question) => {
        totalPoints += question.points;
        const studentAns = answers.find(
          (a: any) => a.questionId === question._id.toString()
        );
        if (studentAns && studentAns.answer === question.correctAnswer) {
          score += question.points;
        }
      });

      // 4. Save Submission
      await Submission.create({
        exam: examId,
        student: studentId,
        answers,
        score,
        institute: exam.institute,
      });
    });
    return { message: "Exam submitted successfully" };
  }
);

import { sendEmail } from "../utils/sendEmail.ts";

// Attendance Notification Function
export const sendLowAttendanceNotice = inngest.createFunction(
  { id: "Send-Low-Attendance-Notice" },
  { event: "attendance/low-notice" },
  async ({ event, step }) => {
    const { studentEmail, studentName, percentage } = event.data;

    await step.run("send-email", async () => {
      await sendEmail({
        email: studentEmail,
        subject: "Low Attendance Alert - NSTI KANPUR",
        message: `Hello ${studentName}, your attendance is currently ${percentage}%, which is below the required 80%. Please make sure to attend trade classes regularly to avoid any academic issues.`,
      });
      return { sent: true };
    });

    return { message: "Notification processed and email sent" };
  }
);
