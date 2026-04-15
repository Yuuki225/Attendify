'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function MobileNavbar({ role, children }: { 
  role: 'siswa' | 'guru' 
  children: React.ReactNode 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userName, setUserName] = useState('User')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (data?.full_name) setUserName(data.full_name)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    setIsSidebarOpen(false)
  }

  const menuSiswa = [
    { label: 'Beranda', icon: '🏠', href: '/siswa' },
    { label: 'Eskul Saya', icon: '📋', href: '/siswa' },
    { label: 'Presensi', icon: '📅', href: '/siswa/presensi' },
  ]

  const menuGuru = [
    { label: 'Dashboard', icon: '📊', href: '/guru' },
    { label: 'Kelola Murid', icon: '👥', href: '/guru' },
    { label: 'Rekap Presensi', icon: '📈', href: '/guru' },
  ]

  const menuItems = role === 'siswa' ? menuSiswa : menuGuru

  return (
    <>
      <nav className="bg-[#A8E8C2] px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-4xl text-emerald-800 hover:scale-110 transition-transform lg:hidden"
        >
          ☰
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-emerald-800 tracking-tight">Attendify</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-5 h-10 rounded-3xl shadow-md">
            <div className="w-7 h-7 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xs font-bold">
              {userName[0] || '?'}
            </div>
            <span className="font-medium text-emerald-700 text-base">{userName}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="hidden lg:flex items-center gap-2 px-6 py-2 bg-white hover:bg-red-50 text-red-600 font-medium rounded-3xl shadow-md transition-all active:scale-[0.97]"
          >
            <span className="text-xl">🚪</span>
            Logout
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-999 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-1000 lg:hidden flex flex-col"
            >
              <div className="bg-[#A8E8C2] px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-3xl flex items-center justify-center text-3xl">E</div>
                  <div>
                    <p className="font-bold text-emerald-800 text-2xl tracking-widest">Attendify</p>
                    <p className="text-xs text-emerald-700 -mt-1">Presensi eskul</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-4xl text-emerald-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-5 rounded-3xl hover:bg-red-50 text-left text-xl font-medium text-red-600 transition-all active:scale-[0.97]"
                >
                  <span className="text-3xl">🚪</span>
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-[calc(100vh-73px)] bg-gray-50">
        {children}
      </main>
    </>
  )
}