import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const schoolName = String(body.schoolName || "").trim();
    const district = String(body.district || "").trim();
    const description = String(body.description || "").trim();
    const gradeRange = String(body.gradeRange || "").trim();
    const contactName = String(body.contactName || "").trim();
    const contactPhone =
      String(body.contactPhone || "").trim() || undefined;
    const booksNeeded = parseInt(String(body.booksNeeded || "0"), 10);

    if (
      !schoolName ||
      !district ||
      !description ||
      !gradeRange ||
      !contactName
    ) {
      return Response.json(
        {
          error:
            "School name, district, description, grade range, and contact name are required",
        },
        { status: 400 },
      );
    }

    if (!booksNeeded || booksNeeded < 1) {
      return Response.json(
        { error: "Please enter how many books are needed (at least 1)" },
        { status: 400 },
      );
    }

    let subjects: string[] = [];
    if (Array.isArray(body.subjects)) {
      subjects = body.subjects.map((s: unknown) => String(s).trim()).filter(Boolean);
    } else if (body.subjects) {
      subjects = String(body.subjects)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const sponsorship = await Sponsorship.create({
      schoolName,
      district,
      description,
      booksNeeded,
      gradeRange,
      contactName,
      contactPhone,
      subjects,
      booksFunded: 0,
      status: "open",
      approvalStatus: "pending",
      coverEmoji: "🏫",
    });

    return Response.json(
      {
        message:
          "Thanks! We'll review your listing and add it to the directory once approved.",
        id: sponsorship._id,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Failed to submit school listing" },
      { status: 400 },
    );
  }
}
