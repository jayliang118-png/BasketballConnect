import { render, screen } from '@testing-library/react'
import { LiveIndicator } from '@/components/game/LiveIndicator'

// Mock the formatRelativeTime function
jest.mock('@/lib/format-time', () => ({
  formatRelativeTime: jest.fn((timestamp: string) => {
    if (timestamp === '2024-01-15T10:05:00Z') return '30 seconds ago'
    if (timestamp === '2024-01-15T10:00:00Z') return '5 minutes ago'
    return 'unknown time'
  }),
}))

describe('LiveIndicator', () => {
  it('renders LIVE badge with correct styling', () => {
    render(<LiveIndicator />)

    const badge = screen.getByText('Live')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-stat-red', 'text-white', 'uppercase', 'animate-pulse')
  })

  it('renders pulsing dot indicator', () => {
    const { container } = render(<LiveIndicator />)

    const dot = container.querySelector('.w-2.h-2.bg-white.rounded-full.animate-pulse')
    expect(dot).toBeInTheDocument()
  })

  it('shows timestamp when lastUpdated is provided', () => {
    render(<LiveIndicator lastUpdated="2024-01-15T10:05:00Z" />)

    const timestamp = screen.getByText(/Updated 30 seconds ago/)
    expect(timestamp).toBeInTheDocument()
    expect(timestamp).toHaveClass('text-xs', 'text-gray-400')
  })

  it('hides timestamp when lastUpdated is not provided', () => {
    render(<LiveIndicator lastUpdated={null} />)

    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
  })

  it('hides timestamp when lastUpdated is undefined', () => {
    render(<LiveIndicator lastUpdated={undefined} />)

    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
  })

  it('hides timestamp when showTimestamp is false', () => {
    render(<LiveIndicator lastUpdated="2024-01-15T10:05:00Z" showTimestamp={false} />)

    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
  })

  it('shows timestamp when showTimestamp is true (default)', () => {
    render(<LiveIndicator lastUpdated="2024-01-15T10:05:00Z" showTimestamp={true} />)

    expect(screen.getByText(/Updated 30 seconds ago/)).toBeInTheDocument()
  })

  it('renders with default props', () => {
    const { container } = render(<LiveIndicator />)

    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('handles different timestamp formats', () => {
    render(<LiveIndicator lastUpdated="2024-01-15T10:00:00Z" />)

    expect(screen.getByText(/Updated 5 minutes ago/)).toBeInTheDocument()
  })
})
