import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma.js";

const NotesPage = async () => {
  const { userId } = auth();
  const allNotes = await prisma.note.findMany({ where: { userId } });
  return <div>{JSON.stringify(allNotes)}</div>;
};

export default NotesPage;

export const generateMetadata = () => {
  return { title: "IntelliNotes - Notes" };
};
