import dotenv from "dotenv";
import { connectDB } from "../lib/db";
import { Book } from "../lib/models/Book";
import { Library } from "../lib/models/Library";
import { Sponsorship } from "../lib/models/Sponsorship";
import { DigitalBook } from "../lib/models/DigitalBook";
import { User } from "../lib/models/User";
import { hashPassword } from "../lib/password";
import { generateToken } from "../lib/tokens";

dotenv.config();

function seedBook(
  data: Record<string, unknown> & {
    location: string;
    district: string;
    latitude?: number;
    longitude?: number;
  },
) {
  const coords: Record<string, number> = {};
  if (data.latitude != null) coords.latitude = data.latitude;
  if (data.longitude != null) coords.longitude = data.longitude;
  return {
    manageToken: generateToken(),
    anonymous: false,
    ...coords,
    ...data,
  };
}

const seedData = async () => {
  await connectDB();

  await Promise.all([
    Book.deleteMany({}),
    Library.deleteMany({}),
    Sponsorship.deleteMany({}),
    DigitalBook.deleteMany({}),
    User.deleteMany({}),
  ]);

  const libraries = await Library.insertMany([
    {
      name: "Kochi Public Library",
      description: "Public reading room near Marine Drive.",
      curatorName: "Anjali Menon",
      location: "Marine Drive",
      district: "Ernakulam",
      state: "Kerala",
      libraryType: "public",
      source: "registered",
      latitude: 9.9312,
      longitude: 76.2673,
      coverEmoji: "🌊",
      bookCount: 0,
      approvalStatus: "approved",
    },
    {
      name: "Thrissur Public Library",
      description: "Textbooks and storybooks for students in Thrissur town.",
      curatorName: "Ravi Kumar",
      location: "Swaraj Round",
      district: "Thrissur",
      state: "Kerala",
      libraryType: "public",
      source: "registered",
      latitude: 10.5276,
      longitude: 76.2144,
      coverEmoji: "📖",
      bookCount: 0,
      approvalStatus: "approved",
    },
    {
      name: "Wayanad Public Library",
      description: "Mountain-side reading room for rural students.",
      curatorName: "Priya Thomas",
      location: "Kalpetta",
      district: "Wayanad",
      state: "Kerala",
      libraryType: "public",
      source: "registered",
      latitude: 11.6101,
      longitude: 76.083,
      coverEmoji: "⛰️",
      bookCount: 0,
      approvalStatus: "approved",
    },
    {
      name: "Trivandrum Central Library",
      description: "Books for commuters near the railway station.",
      curatorName: "Arun Das",
      location: "Thampanoor",
      district: "Thiruvananthapuram",
      state: "Kerala",
      libraryType: "public",
      source: "registered",
      latitude: 8.4875,
      longitude: 76.9525,
      coverEmoji: "🚂",
      bookCount: 0,
      approvalStatus: "approved",
    },
    {
      name: "Kozhikode Beach Library",
      description: "Sunset reading spot — Malayalam and English books.",
      curatorName: "Fathima K",
      location: "Kozhikode Beach",
      district: "Kozhikode",
      state: "Kerala",
      libraryType: "public",
      source: "registered",
      latitude: 11.2588,
      longitude: 75.7804,
      coverEmoji: "🌅",
      bookCount: 0,
      approvalStatus: "approved",
    },
  ]);

  await Book.insertMany([
    seedBook({
      title: "കേരളപ്പുസ്തകം — Kerala History",
      author: "A. Sreedhara Menon",
      category: "non-fiction",
      description:
        "Comprehensive history of Kerala for students and enthusiasts.",
      condition: "good",
      bookLanguage: "Malayalam",
      donorName: "Suresh Nair",
      donorContact: "suresh@example.com",
      location: "Kochi",
      district: "Ernakulam",
      latitude: 9.9312,
      longitude: 76.2673,
      coverEmoji: "📜",
      libraryId: libraries[0]._id,
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Physics — Class 12 (SCERT)",
      author: "Kerala SCERT",
      category: "textbook",
      isTextbook: true,
      grade: "12",
      subject: "Physics",
      board: "Kerala",
      description: "SCERT Physics textbook, lightly used.",
      condition: "good",
      bookLanguage: "English",
      donorName: "Meera V",
      location: "Thrissur",
      district: "Thrissur",
      latitude: 10.5276,
      longitude: 76.2144,
      coverEmoji: "⚛️",
      libraryId: libraries[1]._id,
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Chemmeen",
      author: "Thakazhi Sivasankara Pillai",
      category: "fiction",
      description: "Classic Malayalam novel. Well-loved copy.",
      condition: "fair",
      bookLanguage: "Malayalam",
      donorName: "Deepa Krishnan",
      location: "Alappuzha",
      district: "Alappuzha",
      latitude: 9.4981,
      longitude: 76.3388,
      coverEmoji: "🐟",
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Mathematics — Class 10",
      author: "Kerala SCERT",
      category: "textbook",
      isTextbook: true,
      grade: "10",
      subject: "Mathematics",
      board: "Kerala",
      description: "Complete textbook with minimal markings.",
      condition: "good",
      bookLanguage: "Malayalam",
      donorName: "Arun P",
      location: "Kozhikode",
      district: "Kozhikode",
      latitude: 11.2588,
      longitude: 75.7804,
      coverEmoji: "🔢",
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Panchatantra Stories",
      author: "Various",
      category: "children",
      description: "Illustrated children's storybook collection.",
      condition: "good",
      bookLanguage: "Malayalam",
      donorName: "Lakshmi Devi",
      location: "Kalpetta",
      district: "Wayanad",
      latitude: 11.6101,
      longitude: 76.083,
      coverEmoji: "🦁",
      libraryId: libraries[2]._id,
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Wings of Fire",
      author: "A.P.J. Abdul Kalam",
      category: "non-fiction",
      description: "Inspirational autobiography for young readers.",
      condition: "new",
      bookLanguage: "English",
      donorName: "Nikhil Raj",
      location: "Thiruvananthapuram",
      district: "Thiruvananthapuram",
      latitude: 8.4875,
      longitude: 76.9525,
      coverEmoji: "🚀",
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Social Science — Class 8",
      author: "Kerala SCERT",
      category: "textbook",
      isTextbook: true,
      grade: "8",
      subject: "Social Science",
      board: "Kerala",
      condition: "good",
      bookLanguage: "Malayalam",
      donorName: "Sreeja M",
      location: "Kannur",
      district: "Kannur",
      latitude: 11.8745,
      longitude: 75.3704,
      coverEmoji: "🌍",
      approvalStatus: "approved",
    }),
    seedBook({
      title: "Randamoozham",
      author: "M.T. Vasudevan Nair",
      category: "fiction",
      description: "Epic retelling of Mahabharata from Bhima's perspective.",
      condition: "good",
      bookLanguage: "Malayalam",
      donorName: "Gopal Menon",
      location: "Kottayam",
      district: "Kottayam",
      latitude: 9.5916,
      longitude: 76.5222,
      coverEmoji: "⚔️",
      approvalStatus: "approved",
    }),
  ]);

  await Library.updateMany({}, { $set: { bookCount: 2 } });
  await Library.findByIdAndUpdate(libraries[0]._id, { bookCount: 1 });
  await Library.findByIdAndUpdate(libraries[2]._id, { bookCount: 1 });

  await Sponsorship.insertMany([
    {
      schoolName: "Govt. LPS, Attapadi",
      district: "Palakkad",
      description:
        "Rural school needs Malayalam and English storybooks for primary students.",
      booksNeeded: 50,
      booksFunded: 12,
      subjects: ["Malayalam", "English", "General"],
      gradeRange: "1-4",
      contactName: "Headmaster",
      status: "partially_funded",
      approvalStatus: "approved",
      coverEmoji: "🏫",
    },
    {
      schoolName: "GHSS, Vellarada",
      district: "Thiruvananthapuram",
      description:
        "Class 11 & 12 science textbooks needed for underprivileged students.",
      booksNeeded: 30,
      booksFunded: 0,
      subjects: ["Physics", "Chemistry", "Biology"],
      gradeRange: "11-12",
      contactName: "PTA Secretary",
      status: "open",
      approvalStatus: "approved",
      coverEmoji: "🔬",
    },
    {
      schoolName: "UPS, Edamalakkudy",
      district: "Idukki",
      description:
        "Tribal area school — children's books and basic learning materials.",
      booksNeeded: 40,
      booksFunded: 40,
      subjects: ["Children", "Malayalam"],
      gradeRange: "1-5",
      contactName: "Teacher Coordinator",
      status: "funded",
      approvalStatus: "approved",
      coverEmoji: "🌿",
    },
  ]);

  await DigitalBook.insertMany([
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      genre: "Fiction",
      coverEmoji: "📕",
      url: "https://www.gutenberg.org/ebooks/1342",
      approvalStatus: "approved",
    },
    {
      title: "The Adventures of Sherlock Holmes",
      author: "Arthur Conan Doyle",
      genre: "Mystery",
      coverEmoji: "🕵️",
      url: "https://www.gutenberg.org/ebooks/1661",
      approvalStatus: "approved",
    },
    {
      title: "A Tale of Two Cities",
      author: "Charles Dickens",
      genre: "Classic",
      coverEmoji: "📘",
      url: "https://www.gutenberg.org/ebooks/98",
      approvalStatus: "approved",
    },
    {
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      genre: "Children's",
      coverEmoji: "🐇",
      url: "https://www.gutenberg.org/ebooks/11",
      approvalStatus: "approved",
    },
    {
      title: "Frankenstein",
      author: "Mary Shelley",
      genre: "Gothic",
      coverEmoji: "⚡",
      url: "https://www.gutenberg.org/ebooks/84",
      approvalStatus: "approved",
    },
    {
      title: "The Time Machine",
      author: "H. G. Wells",
      genre: "Sci-fi",
      coverEmoji: "⏳",
      url: "https://www.gutenberg.org/ebooks/35",
      approvalStatus: "approved",
    },
    {
      title: "The Adventures of Tom Sawyer",
      author: "Mark Twain",
      genre: "Children's",
      coverEmoji: "🪵",
      url: "https://www.gutenberg.org/ebooks/74",
      approvalStatus: "approved",
    },
    {
      title: "Dracula",
      author: "Bram Stoker",
      genre: "Gothic",
      coverEmoji: "🦇",
      url: "https://www.gutenberg.org/ebooks/345",
      approvalStatus: "approved",
    },
    {
      title: "The Wonderful Wizard of Oz",
      author: "L. Frank Baum",
      genre: "Children's",
      coverEmoji: "🌈",
      url: "https://www.gutenberg.org/ebooks/55",
      approvalStatus: "approved",
    },
    {
      title: "Meditations",
      author: "Marcus Aurelius",
      genre: "Philosophy",
      coverEmoji: "🏛️",
      url: "https://www.gutenberg.org/ebooks/2680",
      approvalStatus: "approved",
    },
    {
      title: "The Republic",
      author: "Plato",
      genre: "Philosophy",
      coverEmoji: "📜",
      url: "https://www.gutenberg.org/ebooks/1497",
      approvalStatus: "approved",
    },
    {
      title: "Grimms' Fairy Tales",
      author: "Brothers Grimm",
      genre: "Children's",
      coverEmoji: "🧚",
      url: "https://www.gutenberg.org/ebooks/2591",
      approvalStatus: "approved",
    },
  ]);

  const adminPasswordHash = await hashPassword("admin");

  await User.insertMany([
    {
      userName: "superadmin",
      displayName: "Super Admin",
      buId: "BU-HQ",
      role: "super_admin",
      status: "active",
      email: "superadmin@bookundo.local",
      phone: "+91 90000 00001",
      passwordHash: adminPasswordHash,
    },
    {
      userName: "admin",
      displayName: "Platform Admin",
      buId: "BU-HQ",
      role: "admin",
      status: "active",
      email: "admin@bookundo.local",
      phone: "+91 90000 00002",
      passwordHash: adminPasswordHash,
    },
    {
      userName: "curator1",
      displayName: "Anjali Menon",
      buId: "BU-ERN",
      role: "default",
      status: "active",
      email: "anjali@example.com",
      phone: "+91 98765 XXXXX",
    },
  ]);

  console.log("Seed data inserted successfully!");
  console.log("Admin logins: superadmin / admin — password: admin");
  process.exit(0);
};

seedData().catch((err) => {
  console.error(err);
  process.exit(1);
});
