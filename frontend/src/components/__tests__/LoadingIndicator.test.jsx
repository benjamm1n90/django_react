import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingIndicator from '../LoadingIndicator'

describe('LoadingIndicator', () => {
  it('renders a loading container and loader element', () => {
    const { container } = render(<LoadingIndicator />)
    expect(container.querySelector('.loading-container')).toBeInTheDocument()
    expect(container.querySelector('.loader')).toBeInTheDocument()
  })
})
