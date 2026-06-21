import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { Book } from "@/lib/models/Book";
import { toPublicBorrowRequest } from "@/lib/borrow-serialize";
import { generateToken, borrowRequestUrl, manageBookUrl } from "@/lib/tokens";
import { sendBorrowRequestNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {
      bookId,
      borrowerName,
      borrowerContact,
      location,
      district,
      latitude,
      longitude,
      message,
    } = await req.json();

    if (
      !bookId ||
      !borrowerName?.trim() ||
      !borrowerContact?.trim() ||
      !location?.trim() ||
      latitude == null ||
      longitude == null ||
      Number.isNaN(Number(latitude)) ||
      Number.isNaN(Number(longitude))
    ) {
      return Response.json(
        { error: "Name, contact, area, and map location are required" },
        { status: 400 },
      );
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    if (!book.manageToken) {
      book.manageToken = generateToken();
      await book.save();
    }
    if (book.approvalStatus !== "approved") {
      return Response.json(
        { error: "This book is not available yet" },
        { status: 400 },
      );
    }
    if (book.status !== "available") {
      return Response.json(
        { error: "Book is not available for borrowing" },
        { status: 400 },
      );
    }

    const requestToken = generateToken();
    const request = await BorrowRequest.create({
      bookId,
      borrowerName: String(borrowerName).trim(),
      borrowerContact: String(borrowerContact).trim(),
      location: String(location).trim(),
      district: district ? String(district).trim() : undefined,
      latitude: Number(latitude),
      longitude: Number(longitude),
      message: message ? String(message).trim() : undefined,
      requestToken,
    });

    await Book.findByIdAndUpdate(bookId, { status: "reserved" });

    const requestUrl = borrowRequestUrl(requestToken);
    const manageUrl = manageBookUrl(book.manageToken);
    const pickupArea = district
      ? `${location}, ${district}`
      : String(location);

    await sendBorrowRequestNotification({
      donorContact: book.donorContact,
      borrowerContact,
      bookTitle: book.title,
      borrowerName,
      message: [message, `Pickup area: ${pickupArea}`].filter(Boolean).join(" · "),
      manageUrl,
      requestUrl,
    });

    return Response.json(
      {
        request: toPublicBorrowRequest(request),
        requestToken,
        requestUrl,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[borrows POST]", err);
    return Response.json(
      { error: "Failed to create borrow request" },
      { status: 400 },
    );
  }
}
