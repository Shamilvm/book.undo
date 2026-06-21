import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import { toPublicBook, toPublicBooks } from "@/lib/book-serialize";
import { generateToken, manageBookUrl } from "@/lib/tokens";

function autoApproveBooks(): boolean {
  return process.env.AUTO_APPROVE_BOOKS !== "false";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const {
      category,
      district,
      status,
      isTextbook,
      grade,
      subject,
      search,
      limit = "50",
    } = Object.fromEntries(searchParams);

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (district) filter.district = district;
    if (status) filter.status = status;
    else filter.status = "available";
    filter.approvalStatus = "approved";
    if (isTextbook === "true") filter.isTextbook = true;
    else if (isTextbook === "false") {
      filter.isTextbook = { $ne: true };
      filter.category = { $ne: "textbook" };
    }
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;
    if (search) filter.$text = { $search: search };

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("libraryId", "name location district")
      .select("-donorContact -manageToken");

    return Response.json(toPublicBooks(books));
  } catch {
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const book = await Book.create({
      ...body,
      manageToken: generateToken(),
      anonymous: Boolean(body.anonymous),
      approvalStatus: autoApproveBooks() ? "approved" : "pending",
    });

    if (book.libraryId) {
      await Library.findByIdAndUpdate(book.libraryId, {
        $inc: { bookCount: 1 },
      });
    }

    return Response.json(
      {
        book: toPublicBook(book),
        manageToken: book.manageToken,
        manageUrl: manageBookUrl(book.manageToken),
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "Failed to create book" }, { status: 400 });
  }
}
