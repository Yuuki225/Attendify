'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [role, setRole] = useState<'siswa' | 'guru'>('siswa')
  const [nis, setNis] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const email = `${nis}@eskul.school`

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('❌ Login gagal: ' + error.message)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      alert('❌ Gagal mengambil profile: ' + profileError.message)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    const correctRole = profile?.role as 'siswa' | 'guru'
    
    if (profile?.role !== role) {
      console.warn(`⚠️ Role mismatch: User memilih "${role}" tapi role di DB adalah "${profile?.role}". Menggunakan role dari DB.`)
      router.push(correctRole === 'siswa' ? '/siswa' : '/guru')
      setLoading(false)
      return
    }

    router.push(role === 'siswa' ? '/siswa' : '/guru')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-[#A8E8C2] items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="w-40 h-40 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center">
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="45" cy="50" r="22" fill="#10b981" />
              <circle cx="95" cy="50" r="22" fill="#10b981" />
              <circle cx="70" cy="95" r="22" fill="#10b981" />
              <line x1="45" y1="50" x2="95" y2="50" stroke="#10b981" strokeWidth="8" strokeOpacity="0.3" />
              <line x1="45" y1="50" x2="70" y2="95" stroke="#10b981" strokeWidth="8" strokeOpacity="0.3" />
              <line x1="95" y1="50" x2="70" y2="95" stroke="#10b981" strokeWidth="8" strokeOpacity="0.3" />
            </svg>
          </div>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white text-5xl font-bold tracking-widest mt-10"
          >
            Attendify
          </motion.p>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h1 className="text-4xl font-semibold text-emerald-700 text-center mb-2">Masuk Ke Akun Anda</h1>
          <p className="text-emerald-600 text-center mb-10">Pilih peran Anda</p>

          <div className="flex bg-gray-100 rounded-3xl p-1 mb-10 shadow-inner">
            <button
              onClick={() => setRole('siswa')}
              className={`flex-1 py-4 rounded-3xl text-lg font-medium transition-all ${role === 'siswa' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700'}`}
            >
              Murid
            </button>
            <button
              onClick={() => setRole('guru')}
              className={`flex-1 py-4 rounded-3xl text-lg font-medium transition-all ${role === 'guru' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-700'}`}
            >
              Guru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-emerald-700 block mb-2 font-medium">NIS / NIP</label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 2021202"
                className="w-full border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl px-6 py-5 text-lg focus:outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="text-emerald-700 block mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan Password"
                className="w-full border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl px-6 py-5 text-lg focus:outline-none transition-all"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-3xl text-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}