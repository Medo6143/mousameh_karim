import {
  upsertUser,
  getUserByUid,
  getUserByUsername,
  updateUserProfileData,
  updateUsername,
  sendMessage,
  getInboxMessages,
  getSentMessages,
  markAsRead,
  deleteMessage,
  requestReveal,
  acceptReveal,
  type UserProfile,
  type Message,
} from '@/lib/firestore'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore'

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  const mockDocRef = { id: 'mock-doc-ref' }
  return {
    doc: jest.fn(() => mockDocRef),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    limit: jest.fn(() => ({})),
    collection: jest.fn(() => ({})),
    serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
    Timestamp: {
      now: jest.fn(() => ({ _now: true })),
    },
    deleteDoc: jest.fn(),
  }
})

jest.mock('@/lib/firebase', () => ({
  db: {},
}))

describe('Firestore User Profile Functions', () => {
  const mockUser = {
    uid: 'test-uid-123',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('upsertUser', () => {
    it('should create a new user profile when user does not exist', async () => {
      const mockSnap = {
        exists: () => false,
      }
      ;(getDoc as jest.Mock).mockResolvedValue(mockSnap)
      ;(setDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await upsertUser(mockUser)

      expect(getDoc).toHaveBeenCalled()
      expect(setDoc).toHaveBeenCalled()
      expect(result.uid).toBe(mockUser.uid)
      expect(result.displayName).toBe(mockUser.displayName)
      expect(result.username).toContain('test_user_')
      expect(result.bio).toBe('بحب الناس وبكره الخناقات 💛')
      expect(result.messageCount).toBe(0)
    })

    it('should update existing user profile when user exists', async () => {
      const existingProfile: UserProfile = {
        uid: mockUser.uid,
        username: 'existing_username',
        displayName: 'Old Name',
        bio: 'Existing bio',
        photoURL: 'https://example.com/old.jpg',
        messageCount: 5,
        createdAt: {} as Timestamp,
      }

      const mockSnap = {
        exists: () => true,
        data: () => existingProfile,
      }
      ;(getDoc as jest.Mock).mockResolvedValue(mockSnap)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await upsertUser(mockUser)

      expect(getDoc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: mockUser.displayName,
        })
      )
      expect(result.displayName).toBe(mockUser.displayName)
    })

    it('should not overwrite existing photoURL when updating', async () => {
      const existingProfile: UserProfile = {
        uid: mockUser.uid,
        username: 'existing_username',
        displayName: 'Old Name',
        bio: 'Existing bio',
        photoURL: 'https://example.com/existing.jpg',
        messageCount: 5,
        createdAt: {} as Timestamp,
      }

      const mockSnap = {
        exists: () => true,
        data: () => existingProfile,
      }
      ;(getDoc as jest.Mock).mockResolvedValue(mockSnap)
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await upsertUser(mockUser)

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: mockUser.displayName,
        })
      )
      expect(updateDoc).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ photoURL: mockUser.photoURL })
      )
    })
  })

  describe('getUserByUid', () => {
    it('should return user profile when found', async () => {
      const mockProfile: UserProfile = {
        uid: 'test-uid',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        messageCount: 0,
        createdAt: {} as Timestamp,
      }

      const mockSnap = {
        exists: () => true,
        data: () => mockProfile,
      }
      ;(getDoc as jest.Mock).mockResolvedValue(mockSnap)

      const result = await getUserByUid('test-uid')

      expect(result).toEqual(mockProfile)
    })

    it('should return null when user not found', async () => {
      const mockSnap = {
        exists: () => false,
      }
      ;(getDoc as jest.Mock).mockResolvedValue(mockSnap)

      const result = await getUserByUid('non-existent-uid')

      expect(result).toBeNull()
    })
  })

  describe('getUserByUsername', () => {
    it('should return user profile when username exists', async () => {
      const mockProfile: UserProfile = {
        uid: 'test-uid',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        messageCount: 0,
        createdAt: {} as Timestamp,
      }

      const mockSnap = {
        empty: false,
        docs: [{ data: () => mockProfile }],
      }
      ;(getDocs as jest.Mock).mockResolvedValue(mockSnap)

      const result = await getUserByUsername('testuser')

      expect(where).toHaveBeenCalledWith('username', '==', 'testuser')
      expect(result).toEqual(mockProfile)
    })

    it('should return null when username not found', async () => {
      const mockSnap = {
        empty: true,
        docs: [],
      }
      ;(getDocs as jest.Mock).mockResolvedValue(mockSnap)

      const result = await getUserByUsername('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('updateUserProfileData', () => {
    it('should update user profile fields', async () => {
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const updates = {
        bio: 'New bio',
        displayName: 'New Name',
        whatsapp: '+201234567890',
      }

      await updateUserProfileData('test-uid', updates)

      expect(doc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-doc-ref' }),
        updates
      )
    })
  })

  describe('updateUsername', () => {
    it('should update username when available', async () => {
      ;(getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await updateUsername('test-uid', 'newusername')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { username: 'newusername' }
      )
    })

    it('should throw error when username is already taken', async () => {
      const existingProfile: UserProfile = {
        uid: 'different-uid',
        username: 'taken',
        displayName: 'Other User',
        bio: 'Bio',
        messageCount: 0,
        createdAt: {} as Timestamp,
      }

      ;(getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ data: () => existingProfile }],
      })

      await expect(updateUsername('test-uid', 'taken')).rejects.toThrow('اليوزرنيم ده مستخدم خلاص!')
    })
  })
})

describe('Firestore Message Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMessage', () => {
    const mockMessageData = {
      recipientUid: 'recipient-123',
      recipientUsername: 'recipientuser',
      senderUid: 'sender-123',
      senderName: 'Sender Name',
      senderWhatsapp: '+201234567890',
      emotion: 'upset' as Message['emotion'],
      originalText: 'Original message',
      rewrittenText: 'Rewritten message',
      isAnonymous: false,
    }

    it('should create a message and increment recipient message count', async () => {
      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'msg-123' })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ messageCount: 5 }),
      })
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      const result = await sendMessage(mockMessageData)

      expect(addDoc).toHaveBeenCalled()
      expect(result).toBe('msg-123')
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { messageCount: 6 }
      )
    })

    it('should handle anonymous messages without sender info', async () => {
      const anonymousData = {
        ...mockMessageData,
        senderUid: undefined,
        senderName: undefined,
        senderWhatsapp: undefined,
        isAnonymous: true,
      }

      ;(addDoc as jest.Mock).mockResolvedValue({ id: 'anon-msg-123' })
      ;(getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ messageCount: 0 }),
      })

      await sendMessage(anonymousData)

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          senderUid: '',
          senderName: '',
          senderWhatsapp: '',
          isAnonymous: true,
        })
      )
    })
  })

  describe('getInboxMessages', () => {
    it('should return messages for recipient', async () => {
      const mockMessages = [
        { id: 'msg-1', recipientUid: 'user-1', text: 'Hello' },
        { id: 'msg-2', recipientUid: 'user-1', text: 'Hi' },
      ]

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockMessages.map((m) => ({ id: m.id, data: () => m })),
      })

      const result = await getInboxMessages('user-1')

      expect(where).toHaveBeenCalledWith('recipientUid', '==', 'user-1')
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc')
      expect(result).toHaveLength(2)
    })
  })

  describe('getSentMessages', () => {
    it('should return messages sent by user', async () => {
      const mockMessages = [
        { id: 'msg-1', senderUid: 'user-1', createdAt: { toMillis: () => 1000 } },
        { id: 'msg-2', senderUid: 'user-1', createdAt: { toMillis: () => 2000 } },
      ]

      ;(getDocs as jest.Mock).mockResolvedValue({
        docs: mockMessages.map((m) => ({ id: m.id, data: () => m })),
      })

      const result = await getSentMessages('user-1')

      expect(where).toHaveBeenCalledWith('senderUid', '==', 'user-1')
      expect(result).toHaveLength(2)
    })
  })

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await markAsRead('msg-123')

      expect(doc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-doc-ref' }),
        { isRead: true }
      )
    })
  })

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      ;(deleteDoc as jest.Mock).mockResolvedValue(undefined)

      await deleteMessage('msg-123')

      expect(doc).toHaveBeenCalled()
      expect(deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'mock-doc-ref' }))
    })
  })

  describe('requestReveal', () => {
    it('should set recipient consent and match status to pending', async () => {
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await requestReveal('msg-123')

      expect(doc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-doc-ref' }),
        {
          recipientConsent: true,
          matchStatus: 'pending',
        }
      )
    })
  })

  describe('acceptReveal', () => {
    it('should set sender consent and match status to revealed', async () => {
      ;(updateDoc as jest.Mock).mockResolvedValue(undefined)

      await acceptReveal('msg-123')

      expect(doc).toHaveBeenCalled()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'mock-doc-ref' }),
        {
          senderConsent: true,
          matchStatus: 'revealed',
        }
      )
    })
  })
})
