import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Form from '../Form'
import api from '../../api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants'

vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('Form', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders username/password inputs and a submit button labeled for the given method', () => {
    render(
      <MemoryRouter>
        <Form route="/api/token/" method="login" />
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders a Register heading/button when method is register', () => {
    render(
      <MemoryRouter>
        <Form route="/api/user/register/" method="register" />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
  })

  it('stores tokens on successful login submit', async () => {
    api.post.mockResolvedValueOnce({ data: { access: 'access-token', refresh: 'refresh-token' } })

    render(
      <MemoryRouter>
        <Form route="/api/token/" method="login" />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ben' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(localStorage.getItem(ACCESS_TOKEN)).toBe('access-token')
    })
    expect(localStorage.getItem(REFRESH_TOKEN)).toBe('refresh-token')
    expect(api.post).toHaveBeenCalledWith('/api/token/', { username: 'ben', password: 'secret' })
  })

  it('shows an alert and does not store tokens when the request fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    api.post.mockRejectedValueOnce(new Error('Network Error'))

    render(
      <MemoryRouter>
        <Form route="/api/token/" method="login" />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ben' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull()

    alertSpy.mockRestore()
  })
})
