import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma.js";
import { getEmbeddings } from "@/lib/openai";
import { noteIndex } from "@/lib/db/pinecone";

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

    const embeddings = await getEmbeddingForNote(title, content);

    const note = await prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: { title, content, userId },
      });

      await noteIndex.upsert([
        {
          id: note.id,
          values: embeddings,
          metadata: { userId },
        },
      ]);
    });

    return Response.json({ note: note }, { status: 201 });
  } catch (error) {
    console.error({ error });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const PUT = async (req) => {
  try {
    const body = await req.json();
    const parseResult = updateNoteSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 400 });
    }
    const { id, title, content } = parseResult.data;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || note.userId !== userId) {
      return Response.json({ error: "Unauthorized " }, { status: 401 });
    }

    const embeddings = await getEmbeddingForNote(title, content);

    const updatedNote = await prisma.$transaction(async (tx) => {
      const updateNote = await tx.note.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      await noteIndex.upsert([
        {
          id,
          values: embeddings,
          metadata: { userId },
        },
      ]);

      return updateNote;
    });

    return Response.json({ note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error({ error });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    const body = await req.json();
    const parseResult = deleteNoteSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid Input" }, { status: 400 });
    }
    const { id } = parseResult.data;

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || note.userId !== userId) {
      return Response.json({ error: "Unauthorized " }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.note.delete({
        where: { id },
      });
      await noteIndex.deleteOne(id);
    });

    return Response.json({ message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.error({ error });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const getEmbeddingForNote = async (text, content) => {
  return getEmbeddings(text + "\n\n" + content ?? "");
};
