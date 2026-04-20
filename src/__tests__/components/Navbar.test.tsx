import React from 'react'
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Handshake: () => <span data-testid="handshake-icon">🤝</span>,
  Inbox: () => <span data-testid="inbox-icon">📥</span>,
  User: () => <span data-testid="user-icon">👤</span>,
  LogOut: () => <span data-testid="logout-icon">🚪</span>,
  LogIn: () => <span data-testid="login-icon">🔑</span>,
  Key: () => <span data-testid="key-icon">🗝️</span>,
  ChevronDown: () => <span data-testid="chevron-icon">▼</span>,
  Settings: () => <span data-testid="settings-icon">⚙️</span>,
}))

// Mock useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

import { useAuth } from '@/context/AuthContext'

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render logo and navigation links', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Navbar />)

    expect(screen.getByText('المسامح كريم')).toBeInTheDocument()
  })

  it('should show sign in button when user is not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Navbar />)

    expect(screen.getByText('دخول / تسجيل')).toBeInTheDocument()
  })

  it('should show profile link when authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'test-uid', photoURL: 'https://example.com/photo.jpg' },
      profile: { username: 'testuser', displayName: 'Test User', photoURL: 'https://example.com/photo.jpg' },
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Navbar />)

    // There are multiple elements with 'بروفايلي' (desktop and mobile views)
    const profileLinks = screen.getAllByText('بروفايلي')
    expect(profileLinks.length).toBeGreaterThan(0)
    expect(profileLinks[0]).toBeInTheDocument()
  })
})
