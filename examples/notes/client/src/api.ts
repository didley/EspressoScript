import { safeFetch, jsonParse, jsonStringify } from 'shot-lint/utils'

export type Note = {
  readonly id: number
  readonly title: string
  readonly body: string
  readonly createdAt: string
}

export type CreateInput = {
  readonly title: string
  readonly body: string
}

export async function listNotes(): Promise<[readonly Note[] | null, Error | null]> {
  const [res, fetchErr] = await safeFetch('/api/notes')
  if (fetchErr !== null) {
    return [null, fetchErr]
  }
  if (res === null) {
    return [null, new Error('no response')]
  }
  const text = await res.text()
  const [notes, parseErr] = jsonParse<readonly Note[]>(text)
  if (parseErr !== null) {
    return [null, parseErr]
  }
  return [notes, null]
}

export async function createNote(
  input: CreateInput,
): Promise<[Note | null, Error | null]> {
  const [body, serializeErr] = jsonStringify(input)
  if (serializeErr !== null) {
    return [null, serializeErr]
  }
  if (body === null) {
    return [null, new Error('serialization returned null')]
  }
  const [res, fetchErr] = await safeFetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  if (fetchErr !== null) {
    return [null, fetchErr]
  }
  if (res === null) {
    return [null, new Error('no response')]
  }
  const text = await res.text()
  const [note, parseErr] = jsonParse<Note>(text)
  if (parseErr !== null) {
    return [null, parseErr]
  }
  return [note, null]
}

export async function deleteNote(id: number): Promise<[null, Error | null]> {
  const [res, fetchErr] = await safeFetch(`/api/notes/${id}`, { method: 'DELETE' })
  if (fetchErr !== null) {
    return [null, fetchErr]
  }
  if (res === null) {
    return [null, new Error('no response')]
  }
  if (res.status !== 204) {
    const text = await res.text()
    const [errBody, _parseErr] = jsonParse<{ readonly error: string }>(text)
    if (errBody !== null) {
      return [null, new Error(errBody.error)]
    }
    return [null, new Error(`unexpected status ${res.status}`)]
  }
  return [null, null]
}
