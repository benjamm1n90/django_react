import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import api from '../../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants'
import { jwtDecode } from 'jwt-decode'

vi.mock('../../api', () => ({
  default: { post: vi.fn() },
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}))

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Secret Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('redirects to /login when there is no access token', async () => {
    renderProtected()
    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
  })

  it('renders children when the access token is valid and not expired', async () => {
    localStorage.setItem(ACCESS_TOKEN, 'valid-token')
    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 })

    renderProtected()

    await waitFor(() => expect(screen.getByText('Secret Content')).toBeInTheDocument())
  })

  it('redirects to /login if the token is expired and refresh fails', async () => {
    localStorage.setItem(ACCESS_TOKEN, 'expired-token')
    localStorage.setItem(REFRESH_TOKEN, 'refresh-token')
    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 3600 })
    api.post.mockRejectedValueOnce(new Error('refresh failed'))

    renderProtected()

    await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
    expect(api.post).toHaveBeenCalledWith('/api/token/refresh/', { refresh: 'refresh-token' })
  })

  it('refreshes the token and renders children if refresh succeeds', async () => {
    localStorage.setItem(ACCESS_TOKEN, 'expired-token')
    localStorage.setItem(REFRESH_TOKEN, 'refresh-token')
    jwtDecode.mockReturnValue({ exp: Date.now() / 1000 - 3600 })
    api.post.mockResolvedValueOnce({ status: 200, data: { access: 'new-access-token' } })

    renderProtected()

    await waitFor(() => expect(screen.getByText('Secret Content')).toBeInTheDocument())
    expect(localStorage.getItem(ACCESS_TOKEN)).toBe('new-access-token')
  })
})
