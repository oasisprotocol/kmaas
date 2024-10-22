"use client"

import {React, useState, useEffect} from "react";
import styles from "./styles.module.css";
import {ethers} from "hardhat";
import {logNoteChange, createNote, saveNote, retrieveNotes} from "/src/lib/kmaas-client";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();
    const [notes, setNotes] = useState([{}]);

    const [activeNote, setActiveNote] = useState(null);

    useEffect(() => {
        const fetchNotes = async () => {
            var username;
            const session = await getSession();
            if (!session) {
                router.push("/landing");
            } else {
                username = session.user.username;
                var retrievedNotes = await retrieveNotes(username);
                console.log(retrievedNotes);
                if (!retrievedNotes) {
                   retrievedNotes = [];
                }
                setNotes(retrievedNotes);
            }
        }

        fetchNotes();
    }, []);



    const addNewNote = async () => {
      // TODO Modify this so that it's not a window popup
      const title = window.prompt("Title: ");

      if (!title || title.trim() === '') {
        alert("Note creation cancelled: Title cannot be empty.");
        return;
      }

      const newNote = await createNote(title);

      setNotes([newNote, ...notes]);
      setActiveNote(newNote.id);

      await logNoteChange("logNoteCreated", newNote);
    };

    const updateNote = async (updatedNote) => {
      const updatedNotes = notes.map(note =>
        note.id === updatedNote.id ? updatedNote : note
      );
      setNotes(updatedNotes);
      await saveNote(updatedNote);
      await logNoteChange("logNoteUpdated", updatedNote);
    };
    return (
      <div className={styles.app}>
        <Sidebar
          notes={notes}
          activeNote={activeNote}
          setActiveNote={setActiveNote}
          addNewNote={addNewNote}
        />
        <NoteEditor
          activeNote={notes ? notes.find(note => note.id === activeNote) : {}}
          updateNote={updateNote}
        />
      </div>
    );
}

function Sidebar({ notes, activeNote, setActiveNote, addNewNote,}:
    {notes: any[], activeNote: any, setActiveNote: () => void, addNewNote: () => void}) {
  return (
    <div className={styles.sidebar}>
      <button className={styles['new-note-btn']} onClick={addNewNote}>+ New Note</button>
      <div className={styles["note-list"]}>
        {notes.map(note => (
          <div
            key={note.id}
            className={styles["note-item"]}
            onClick={() => setActiveNote(note.id)}
          >
            <div className={styles["note-title"]}>{note.title || 'Untitled Note'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteEditor({ activeNote, updateNote }: {activeNote: any, updateNote: (any) => void}) {
  const [localNote, setLocalNote] = useState({ title: '', content: '' });

  // Sync the local state with the activeNote when the component renders or when activeNote changes
  useEffect(() => {
    if (activeNote) {
      setLocalNote({
        title: activeNote.title,
        content: activeNote.content,
      });
    }
  }, [activeNote]);

  // Handle input changes locally
  const onEditNote = (key, value) => {
    setLocalNote({
      ...localNote,
      [key]: value,
    });
  };

  // Save the updated note when the save button is clicked
  const onSaveNote = () => {
    updateNote({
      ...activeNote,
      title: localNote.title,
      content: localNote.content,
    });
  };


  if (!activeNote) {
    return <div className={styles["no-active-note"]}>No note selected</div>;
  }

  return (
    <div className={styles["note-editor"]}>
      <input
        type="text"
        value={localNote.title}
        onChange={(e) => onEditNote('title', e.target.value)}
        className={styles["note-title-input"]}
        placeholder="Title"
      />
      <textarea
        value={localNote.content}
        onChange={(e) => onEditNote('content', e.target.value)}
        className={styles["note-content-textarea"]}
        placeholder="Start typing your note..."
      />
      <button className={styles["save-btn"]} onClick={onSaveNote}>💾 Save</button>
    </div>);
}

