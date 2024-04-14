"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import AddEditNoteDialog from "./AddEditNoteDialog";

const Note = ({ note }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const wasUpdated = note.updatedAt > note.createdAt;

  const createdUpdatedAtTimeStamp = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString();

  const handleEditClick = () => {
    setShowEditDialog((prev) => !prev);
  };
  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={handleEditClick}
      >
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimeStamp}
            {wasUpdated && "(updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{note.content}</p>
        </CardContent>
      </Card>
      <AddEditNoteDialog
        open={showEditDialog}
        setOpen={handleEditClick}
        noteToEdit={note}
      />
    </>
  );
};

export default Note;
