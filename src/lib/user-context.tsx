'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CurrentUser {
  id: string
  name: string
  role: string
  area: string | null
}

interface UserContextType {
  currentUser: CurrentUser | null
  setCurrentUser: (user: CurrentUser | null) => void
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('sellercener-user')
    if (stored) {
      try {
        setCurrentUserState(JSON.parse(stored))
      } catch {
        localStorage.removeItem('sellercener-user')
      }
    }
  }, [])

  function setCurrentUser(user: CurrentUser | null) {
    setCurrentUserState(user)
    if (user) {
      localStorage.setItem('sellercener-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sellercener-user')
    }
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useCurrentUser() {
  return useContext(UserContext)
}
