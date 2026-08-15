'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../backend/firebase'

const AuthContext = createContext({ user: null, userProfile: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profileData = null
        // Check if Firestore user doc exists, create if it doesn't
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)

          if (!userSnap.exists()) {
            const initialDoc = {
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
              mail: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              userCourses: [],
              interests: typeof window !== 'undefined' ? localStorage.getItem('adrenalearn_user_interests') || '' : '',
              lessonQuota: 5,
              quotaPeriod: 'daily',
              points: {},
              gameCounts: {},
              lastPlayed: {},
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
            await setDoc(userRef, initialDoc)
            profileData = initialDoc
          } else {
            profileData = userSnap.data()
            if (profileData?.interests && typeof window !== 'undefined') {
              localStorage.setItem('adrenalearn_user_interests', profileData.interests)
            }
          }
        } catch (err) {
          console.error('Error ensuring user doc:', err)
        }

        setUser(firebaseUser)
        setUserProfile(profileData)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
