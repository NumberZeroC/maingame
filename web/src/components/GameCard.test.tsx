import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import GameCard from '../components/GameCard'

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('GameCard', () => {
  const defaultProps = {
    id: 'test-game-id',
    name: 'Test Game',
    description: 'A test game description',
    thumbnail: 'http://example.com/image.jpg',
    rating: 4.5,
    players: 15000,
    category: ['action', 'adventure'],
  }

  it('should render game name', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.getByText('Test Game')).toBeInTheDocument()
  })

  it('should render game description', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.getByText('A test game description')).toBeInTheDocument()
  })

  it('should render rating with one decimal place', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('should render players count formatted for large numbers', () => {
    renderWithRouter(<GameCard {...defaultProps} players={20000} />)
    expect(screen.getByText('2万+')).toBeInTheDocument()
  })

  it('should render players count as is for small numbers', () => {
    renderWithRouter(<GameCard {...defaultProps} players={500} />)
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('should render category tags', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.getByText('action')).toBeInTheDocument()
    expect(screen.getByText('adventure')).toBeInTheDocument()
  })

  it('should only show first two categories', () => {
    renderWithRouter(<GameCard {...defaultProps} category={['action', 'adventure', 'rpg']} />)
    expect(screen.getByText('action')).toBeInTheDocument()
    expect(screen.getByText('adventure')).toBeInTheDocument()
    expect(screen.queryByText('rpg')).not.toBeInTheDocument()
  })

  it('should render AI badge when badges include "ai"', () => {
    renderWithRouter(<GameCard {...defaultProps} badges={['ai']} />)
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('should render HOT badge when badges include "hot"', () => {
    renderWithRouter(<GameCard {...defaultProps} badges={['hot']} />)
    expect(screen.getByText('HOT')).toBeInTheDocument()
  })

  it('should render NEW badge when badges include "new"', () => {
    renderWithRouter(<GameCard {...defaultProps} badges={['new']} />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('should render multiple badges', () => {
    renderWithRouter(<GameCard {...defaultProps} badges={['ai', 'hot']} />)
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('HOT')).toBeInTheDocument()
  })

  it('should not render badges when badges is undefined', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.queryByText('AI')).not.toBeInTheDocument()
    expect(screen.queryByText('HOT')).not.toBeInTheDocument()
    expect(screen.queryByText('NEW')).not.toBeInTheDocument()
  })

  it('should render play button on hover', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    expect(screen.getByText('立即玩')).toBeInTheDocument()
  })

  it('should link to correct game page', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/game/test-game-id')
  })

  it('should render thumbnail with correct alt text', () => {
    renderWithRouter(<GameCard {...defaultProps} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Test Game')
    expect(img).toHaveAttribute('src', 'http://example.com/image.jpg')
  })
})
