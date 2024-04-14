import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma.js";
import Note from "@/components/Note";

const NotesPage = async () => {
  const { userId } = auth();
  const allNotes = await prisma.note.findMany({ where: { userId } });
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allNotes.map((note) => (
        <Note note={note} key={note.id} />
      ))}
      {allNotes.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet. Why don't you create one?"}
        </div>
      )}
    </div>
  );
};

export default NotesPage;

export const generateMetadata = () => {
  return { title: "IntelliNotes - Notes" };
};
