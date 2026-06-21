import mongoose from "mongoose";
import { generateToken } from "@/lib/tokens";

let ensured = false;

export async function ensureTokenFields(): Promise<void> {
  if (ensured) return;

  const db = mongoose.connection.db;
  if (!db) return;

  const borrowCol = db.collection("borrowrequests");
  const bookCol = db.collection("books");

  const borrowMissing = await borrowCol
    .find({
      $or: [
        { requestToken: { $exists: false } },
        { requestToken: null },
        { requestToken: "" },
      ],
    })
    .project({ _id: 1 })
    .toArray();

  for (const doc of borrowMissing) {
    await borrowCol.updateOne(
      { _id: doc._id },
      {
        $set: {
          requestToken: generateToken(),
          location: "Legacy request",
          latitude: 0,
          longitude: 0,
        },
      },
    );
  }

  const bookMissing = await bookCol
    .find({
      $or: [
        { manageToken: { $exists: false } },
        { manageToken: null },
        { manageToken: "" },
      ],
    })
    .project({ _id: 1 })
    .toArray();

  for (const doc of bookMissing) {
    await bookCol.updateOne(
      { _id: doc._id },
      { $set: { manageToken: generateToken(), anonymous: false } },
    );
  }

  try {
    await borrowCol.dropIndex("requestToken_1");
  } catch {
    /* index may not exist yet */
  }

  await borrowCol.createIndex(
    { requestToken: 1 },
    { unique: true, sparse: true, name: "requestToken_1" },
  );

  try {
    await bookCol.dropIndex("manageToken_1");
  } catch {
    /* index may not exist yet */
  }

  await bookCol.createIndex(
    { manageToken: 1 },
    { unique: true, sparse: true, name: "manageToken_1" },
  );

  ensured = true;
}
