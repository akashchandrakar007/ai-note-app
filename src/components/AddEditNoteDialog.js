"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createNoteSchema } from "@/lib/validation/note";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./LoadingButton";
import { useRouter } from "next/navigation";

const AddEditNoteDialog = ({ open, setOpen, noteToEdit }) => {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.content || "",
    },
  });

  const onSubmit = async (input) => {
    try {
      if (noteToEdit) {
        const response = await fetch("api/notes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input,
          }),
        });
        setOpen();
      } else {
        const response = await fetch("api/notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw Error("Status code: " + response.status);
        }

        form.reset();
        setOpen();
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong, Please try again");
    }
  };

  const deleteNote = async () => {
    if (!noteToEdit) return;
    setDeleteInProgress(true);
    try {
      const response = await fetch("api/notes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      });
      if (!response.ok) {
        throw Error("Status code: " + response.status);
      }
      setOpen();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong, Please try again");
    } finally {
      setDeleteInProgress(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{noteToEdit ? "Edit Note" : "Add Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Note Content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              {noteToEdit && (
                <LoadingButton
                  className="mt-4"
                  type="button"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteNote}
                  variant="destructive"
                >
                  Delete Note
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                className="mt-4"
                disabled={deleteInProgress}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditNoteDialog;
