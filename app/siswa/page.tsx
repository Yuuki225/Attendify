/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import MobileNavbar from '@/components/MobileNavbar'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type EskulSaya = {
  id: number
  nama: string
  status: string
}

const getEskulImage = (eskulNama: string): string => {
  const eskulMap: Record<string, string> = {
    'Robotik': 'robotik.jpg',
    'Futsal': 'futsal.jpeg',
    'Basket': 'basketball.jpeg',
    'Karate': 'karate.jpg',
    'Photography': 'photography.jpg',
    'English Club': 'English-Club.jpg',
    'PMR': 'pmr.jpeg',
    'Paskibra': 'paskibra.png',
    'Math Club': 'math.png',
    'IRMA': 'irma.jpg',
  }
  return eskulMap[eskulNama] || 'robotik.jpg'
}

export default function SiswaHomePage() {
  const [eskulSaya, setEskulSaya] = useState<EskulSaya[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchEskulSaya = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('eskul_siswa')
          .select(`
            eskul (
              id,
              nama,
              status
            )
          `)
          .eq('siswa_id', user.id)

        if (error) {
          setEskulSaya([])
        } else {
          const eskul = data?.map((item: any) => item.eskul).filter(Boolean) || []
          setEskulSaya(eskul)
        }
      } catch (err) {
        setEskulSaya([])
      } finally {
        setLoading(false)
      }
    }

    fetchEskulSaya()
  }, [router])

  if (loading) {
    return (
      <MobileNavbar role="siswa">
        <div className="min-h-screen flex items-center justify-center text-emerald-700">
          Memuat Eskul Saya...
        </div>
      </MobileNavbar>
    )
  }

  return (
    <MobileNavbar role="siswa">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        {eskulSaya.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 max-w-md mx-auto"
          >
            <div className="mx-auto w-28 h-28 bg-emerald-100 rounded-3xl flex items-center justify-center text-6xl mb-8">
              📭
            </div>
            <h3 className="text-3xl font-semibold text-emerald-800 mb-3">Belum ada eskul</h3>
            <p className="text-emerald-600 text-lg">
              Guru belum mendaftarkan kamu ke ekstrakurikuler apapun.<br />
              Silakan hubungi guru eskul yang kamu inginkan.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-emerald-800 mb-8">
              Eskul yang Saya Ikuti
            </motion.h2>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  },
                },
              }}
            >
              {eskulSaya.map((eskul, index) => (
                <motion.div
                  key={eskul.id}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#d1f0df] rounded-3xl overflow-hidden shadow-xl border border-[#A8E8C2]/60 group cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-full h-56 bg-linear-to-br from-[#A8E8C2] to-[#7dd3c0] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                      <Image
                        src={`/asset/${getEskulImage(eskul.nama)}`}
                        alt={eskul.nama}
                        width={300}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-4 right-4 px-4 py-1 bg-white/95 backdrop-blur-sm rounded-3xl text-xs font-bold flex items-center gap-1.5 shadow">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`w-3 h-3 rounded-full ${eskul.status?.toLowerCase() === 'aktif' ? 'bg-green-500' : 'bg-red-500'}`} 
                      />
                      {eskul.status}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <h3 className="text-2xl font-semibold text-emerald-800">{eskul.nama}</h3>
                    <button
                      onClick={() => router.push(`/siswa/eskul/${eskul.id}`)}
                      className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2"
                    >
                      Buka Presensi →
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </MobileNavbar>
  )
}