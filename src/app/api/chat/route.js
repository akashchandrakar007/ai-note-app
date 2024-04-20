import { noteIndex } from "@/lib/db/pinecone";
import openai, { getEmbeddings } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma.js";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const messages = (await body.messages) || [];

    const messageTruncated = messages?.slice(-6);

    const embeddings = await getEmbeddings(
      messageTruncated?.map((message) => message.content)?.join("\n"),
    );

    const { userId } = auth();

    const vectorQueryResponse = await noteIndex.query({
      vector: embeddings,
      topK: 1,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches?.map((match) => match.id),
        },
      },
    });

    const systemMessage = {
      role: "system",
      content:
        "You are an intelligent note-taking app. You answer the user's question based on their existing notes ." +
        "The relevant notes for this query are:\n" +
        relevantNotes
          ?.map((note) => `Title: ${note.title}\n\nContent: ${note.content}`)
          ?.join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messageTruncated],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error({ error });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
