import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Note from '../Note'

const note = {
  id: 42,
  title: 'Cross-country move',
  content: '3 bedroom house, piano',
  created_at: '2026-01-15T00:00:00Z',
}

describe('Note', () => {
  it('renders title, content, and a formatted date', () => {
    render(<Note note={note} onDelete={() => {}} />)
    expect(screen.getByText(note.title)).toBeInTheDocument()
    expect(screen.getByText(note.content)).toBeInTheDocument()
  })

  it('calls onDelete with the note id when the delete button is clicked', () => {
    const onDelete = vi.fn()
    render(<Note note={note} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(note.id)
  })
})
