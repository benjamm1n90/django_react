import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import Estimate from '../Estimate'
import api from '../../api'

vi.mock('../../api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const baseEstimate = {
  id: 1,
  customer_name: 'Jane Doe',
  square_footage: 1000,
  pound_estimate: 500,
  crew_size: 2,
  price: 740,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  notes: [],
}

describe('Estimate page notes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and renders existing estimates on mount', async () => {
    api.get.mockResolvedValueOnce({ data: [baseEstimate] })

    render(<Estimate />)

    await waitFor(() => expect(screen.getByText(/Jane Doe/)).toBeInTheDocument())
    expect(api.get).toHaveBeenCalledWith('/api/estimates/')
  })

  it('shows an "Add Notes" toggle that reveals a note form, and hides it again', async () => {
    api.get.mockResolvedValue({ data: [baseEstimate] })

    render(<Estimate />)
    await waitFor(() => expect(screen.getByText(/Jane Doe/)).toBeInTheDocument())

    expect(screen.queryByPlaceholderText('Note title')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add Notes' }))
    expect(screen.getByPlaceholderText('Note title')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hide Notes' }))
    expect(screen.queryByPlaceholderText('Note title')).not.toBeInTheDocument()
  })

  it('renders existing notes nested under their estimate', async () => {
    const withNotes = {
      ...baseEstimate,
      notes: [{ id: 5, title: 'Fragile items', content: 'wrap the china', created_at: '2026-01-02T00:00:00Z' }],
    }
    api.get.mockResolvedValue({ data: [withNotes] })

    render(<Estimate />)
    await waitFor(() => expect(screen.getByText(/Jane Doe/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Add Notes' }))
    expect(screen.getByText('Fragile items')).toBeInTheDocument()
    expect(screen.getByText('wrap the china')).toBeInTheDocument()
  })

  it('submits a new note to the estimate-scoped endpoint and refreshes', async () => {
    api.get.mockResolvedValue({ data: [baseEstimate] })
    api.post.mockResolvedValueOnce({ data: { id: 9 } })

    render(<Estimate />)
    await waitFor(() => expect(screen.getByText(/Jane Doe/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Add Notes' }))
    fireEvent.change(screen.getByPlaceholderText('Note title'), { target: { value: 'Heavy piano' } })
    fireEvent.change(screen.getByPlaceholderText('Note details'), { target: { value: 'needs 2 extra movers' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/estimates/1/notes/', {
        title: 'Heavy piano',
        content: 'needs 2 extra movers',
      })
    })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  })

  it('deletes a note via the note-scoped delete endpoint', async () => {
    const withNotes = {
      ...baseEstimate,
      notes: [{ id: 5, title: 'Fragile items', content: 'wrap the china', created_at: '2026-01-02T00:00:00Z' }],
    }
    api.get.mockResolvedValue({ data: [withNotes] })
    api.delete.mockResolvedValueOnce({ status: 204 })

    render(<Estimate />)
    await waitFor(() => expect(screen.getByText(/Jane Doe/)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Add Notes' }))
    const noteCard = screen.getByText('Fragile items').closest('.note-container')
    fireEvent.click(within(noteCard).getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/api/notes/delete/5/'))
  })
})
