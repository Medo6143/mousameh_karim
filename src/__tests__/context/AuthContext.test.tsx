import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
import { upsertUser, getUserByUid } from '@/lib/firestore'

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    setCustomParameters: jest.fn(),
  })),
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(() => ({})),
}))

jest.mock('@/lib/firestore', () => ({
  upsertUser: jest.fn(),
  getUserByUid: jest.fn(),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  default: {},
}))

// Test component to access auth context
function TestComponent() {
  const { user, profile, loading, signInWithGoogle, signOut: signOutFn } = useAuth()

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.uid : 'no-user'}</div>
      <div data-testid="profile">{profile ? profile.username : 'no-profile'}</div>
      <button onClick={signInWithGoogle} data-testid="signin-btn">
        Sign In
      </button>
      <button onClick={signOutFn} data-testid="signout-btn">
        Sign Out
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUnsubscribe = jest.fn()
  const mockUnsubscribeProfile = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should show loading initially', () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
  })

  it('should handle unauthenticated user', async () => {
    let authCallback: ((user: null) => void) | null = null

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      if (authCallback) authCallback(null)
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
      expect(screen.getByTestId('profile')).toHaveTextContent('no-profile')
    })
  })

  it('should handle authenticated user and create profile', async () => {
    const mockUser = {
      uid: 'test-uid-123',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    }

    const mockProfile = {
      uid: 'test-uid-123',
      username: 'testuser_1234',
      displayName: 'Test User',
      bio: 'Test bio',
      messageCount: 0,
    }

    let authCallback: ((user: typeof mockUser) => void) | null = null
    let snapshotCallback: ((doc: { exists: () => boolean; data: () => typeof mockProfile }) => void) | null = null

    ;(onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authCallback = callback
      return mockUnsubscribe
    })

    ;(onSnapshot as jest.Mock).mockImplementation((ref, onNext, onError) => {
      snapshotCallback = onNext
      return mockUnsubscribeProfile
    })

    ;(upsertUser as jest.Mock).mockResolvedValue(mockProfile)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await act(async () => {
      if (authCallback) authCallback(mockUser)
    })

    await waitFor(() => {
      expect(upsertUser).toHaveBeenCalledWith({
        uid: mockUser.uid,
        displayName: mockUser.displayName,
        photoURL: mockUser.photoURL,
      })
    })

    await act(async () => {
      if (snapshotCallback) {
        snapshotCallback({
          exists: () => true,
          data: () => mockProfile,
        })
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.uid)
      expect(screen.getByTestId('profile')).toHaveTextContent(mockProfile.username)
    })
  })

  it('should call signInWithGoogle when button clicked', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe)
    ;(signInWithPopup as jest.Mock).mockResolvedValue({})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInBtn = screen.getByTestId('signin-btn')
    await userEvent.click(signInBtn)

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled()
    })
  })

  it('should call signOut when button clicked', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe)
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutBtn = screen.getByTestId('signout-btn')
    await userEvent.click(signOutBtn)

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
  })

  it('should unsubscribe on unmount', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(() => mockUnsubscribe)

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
