import create from 'zustand'

type AuthState = {
  token: string | null
  setToken: (t: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? (localStorage.getItem('rwh_token') || null) : null,
  setToken: (t) => {
    if (t) localStorage.setItem('rwh_token', t)
    else localStorage.removeItem('rwh_token')
    set({ token: t })
  },
}))
