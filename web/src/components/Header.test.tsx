import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'

describe('Header', () => {
  const renderWithRouter = (initialRoute: string = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Header />
      </MemoryRouter>
    )
  }

  it('should render logo and title', () => {
    renderWithRouter()

    expect(screen.getByText('AI游戏平台')).toBeInTheDocument()
  })

  it('should render navigation links', () => {
    renderWithRouter()

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('游戏')).toBeInTheDocument()
    expect(screen.getByText('排行')).toBeInTheDocument()
  })

  it('should highlight active nav item', () => {
    renderWithRouter('/games')

    const gamesLink = screen.getByText('游戏').closest('a')
    expect(gamesLink).toHaveClass('nav-link-active')
  })

  it('should render profile link', () => {
    renderWithRouter()

    const profileLink = screen.getByRole('link', { name: '' })
    expect(profileLink).toBeInTheDocument()
  })

  it('should render search button', () => {
    renderWithRouter()

    const searchButton = screen.getByRole('button', { name: '' })
    expect(searchButton).toBeInTheDocument()
  })
})
