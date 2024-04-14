import { createNoteSchema } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma.js";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const parseResult = createNoteSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 400 });
    }

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized " }, { status: 401 });
    }

    const { title, content } = parseResult.data;

    const note = await prisma.note.create({
      data: { title, content, userId },
    });

    return Response.json({ note: note }, { status: 201 });
  } catch (error) {
    console.error({ error });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
