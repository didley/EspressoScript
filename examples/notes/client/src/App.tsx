import { useState, useEffect } from 'react'
import { listNotes, createNote, deleteNote } from './api'
import type { Note, CreateInput } from './api'

type FormState = {
  readonly title: string
  readonly body: string
}

function NoteItem({
  note,
  onDelete,
}: {
  readonly note: Note
  readonly onDelete: (id: number) => Promise<void>
}): JSX.Element {
  function handleDeleteClick(): void {
    void onDelete(note.id)
  }

  return (
    <li
      style={{
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '6px',
        marginBottom: '0.75rem',
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{note.title}</strong>
      {note.body.length > 0 && <p style={{ margin: '0 0 0.5rem', color: '#555' }}>{note.body}</p>}
      <small style={{ color: '#999' }}>{new Date(note.createdAt).toLocaleString()}</small>
      <button
        type="button"
        onClick={handleDeleteClick}
        style={{ display: 'block', marginTop: '0.5rem', cursor: 'pointer' }}
      >
        Delete
      </button>
    </li>
  )
}

function App(): JSX.Element {
  const [notes, setNotes] = useState<readonly Note[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({ title: '', body: '' })

  useEffect(function initNotes(): void {
    void loadNotes()
  }, [])

  async function loadNotes(): Promise<void> {
    const [result, err] = await listNotes()
    if (err !== null) {
      setError(err.message)
      return
    }
    if (result !== null) {
      setNotes(result)
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setForm({ title: e.target.value, body: form.body })
  }

  function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setForm({ title: form.title, body: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    const input: CreateInput = { title: form.title, body: form.body }
    const [note, err] = await createNote(input)
    if (err !== null) {
      setError(err.message)
      return
    }
    if (note !== null) {
      setNotes([...notes, note])
      setForm({ title: '', body: '' })
      setError(null)
    }
  }

  async function handleDelete(id: number): Promise<void> {
    const [_result, err] = await deleteNote(id)
    if (err !== null) {
      setError(err.message)
      return
    }
    setNotes(
      notes.filter(function keepOthers(n: Note): boolean {
        return n.id !== id
      }),
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h1>Notes</h1>
      {error !== null && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}
      <form
        onSubmit={function onFormSubmit(e: React.FormEvent<HTMLFormElement>): void {
          void handleSubmit(e)
        }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={handleTitleChange}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <textarea
            placeholder="Body (optional)"
            value={form.body}
            onChange={handleBodyChange}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1.25rem', fontSize: '1rem', cursor: 'pointer' }}>
          Add Note
        </button>
      </form>
      {notes.length === 0 && <p style={{ color: '#999' }}>No notes yet.</p>}
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {notes.map(function renderNote(note: Note): JSX.Element {
          return <NoteItem key={note.id} note={note} onDelete={handleDelete} />
        })}
      </ul>
    </div>
  )
}

export default App
