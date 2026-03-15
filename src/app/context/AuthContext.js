'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../backend/firebase'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if Firestore user doc exists, create if it doesn't
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)

          if (!userSnap.exists()) {
            // First-time sign-in: create the user document
            await setDoc(userRef, {
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
              mail: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              userCourses: [],
              lessonQuota: 5,
              quotaPeriod: 'daily',
              points: {},
              gameCounts: {},
              lastPlayed: {},
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
        } catch (err) {
          console.error('Error ensuring user doc:', err)
        }

        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
