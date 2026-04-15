'use client'

export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MobileNavbar from '@/components/MobileNavbar'
import Image from 'next/image'

type PresensiBulan = {
  tanggal: string
  status: 'hadir' | 'sakit' | 'izin'
  keterangan?: string
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

export default function PresensiPage() {
  const params = useParams()
  const router = useRouter()
  const eskulId = params.id as string

  const [eskulName, setEskulName] = useState('')
  const [userInfo, setUserInfo] = useState({ name: '', id: '' })
  const [today, setToday] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'hadir' | 'sakit' | 'izin' | null>(null)
  const [keterangan, setKeterangan] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [riwayat, setRiwayat] = useState<PresensiBulan[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setUserInfo({ name: profile?.full_name || 'User', id: user.id })

        const { data: eskul } = await supabase
          .from('eskul')
          .select('nama')
          .eq('id', eskulId)
          .single()

        setEskulName(eskul?.nama || 'Ekstrakurikuler')

        const now = new Date()
        const dateStr = now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        setToday(dateStr)

        const todayDate = now.toISOString().split('T')[0]
        const { data: todayPresensi } = await supabase
          .from('presensi')
          .select('status, keterangan')
          .eq('siswa_id', user.id)
          .eq('eskul_id', eskulId)
          .eq('tanggal', todayDate)
          .single()

        if (todayPresensi) {
          setSelectedStatus(todayPresensi.status)
          setKeterangan(todayPresensi.keterangan || '')
          setSubmitted(true)
        }

        const { data: history } = await supabase
          .from('presensi')
          .select('tanggal, status, keterangan')
          .eq('siswa_id', user.id)
          .eq('eskul_id', eskulId)
          .order('tanggal', { ascending: false })
          .limit(10)

        if (history) {
          setRiwayat(history)
        }
      } catch (err) {
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [eskulId, router])

  const handleSubmit = async () => {
    if (!selectedStatus) {
      alert('Pilih status kehadiran terlebih dahulu')
      return
    }

    if (selectedStatus === 'izin' && !keterangan.trim()) {
      alert('Masukkan keterangan izin')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const todayDate = now.toISOString().split('T')[0]

      const insertData: any = {
        siswa_id: user.id,
        eskul_id: eskulId,
        tanggal: todayDate,
        status: selectedStatus,
      }

      if (selectedStatus === 'izin') {
        insertData.keterangan = keterangan
      }

      const { data: existingPresensi, error: checkError } = await supabase
        .from('presensi')
        .select('id')
        .eq('siswa_id', user.id)
        .eq('eskul_id', eskulId)
        .eq('tanggal', todayDate)
        .single()

      let error = null
      if (existingPresensi) {
        const { error: updateError } = await supabase
          .from('presensi')
          .update(insertData)
          .eq('id', existingPresensi.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('presensi')
          .insert(insertData)
        error = insertError
      }

      if (error) {
        console.error('❌ Error:', error)
        alert('❌ Gagal submit presensi: ' + error.message)
        return
      }

      setSubmitted(true)
      setShowSuccessModal(true)
      
      const { data: history } = await supabase
        .from('presensi')
        .select('tanggal, status, keterangan')
        .eq('siswa_id', user.id)
        .eq('eskul_id', eskulId)
        .order('tanggal', { ascending: false })
        .limit(10)

      if (history) {
        setRiwayat(history)
      }
    } catch (err) {
      console.error('Error:', err)
      alert('❌ Error: ' + String(err))
    }
  }

  if (loading) {
    return (
      <MobileNavbar role="siswa">
        <div className="min-h-screen flex items-center justify-center text-emerald-700">
          Loading...
        </div>
      </MobileNavbar>
    )
  }

  return (
    <MobileNavbar role="siswa">
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-12">
        {/* Header dengan Gambar */}
        <div className="mb-8 rounded-3xl overflow-hidden shadow-lg">
          <div className="w-full h-48 bg-gradient-to-br from-[#A8E8C2] to-[#7dd3c0] flex items-center justify-center overflow-hidden">
            <Image
              src={`/asset/${getEskulImage(eskulName)}`}
              alt={eskulName}
              width={400}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-white p-6">
            <button
              onClick={() => router.back()}
              className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2 mb-3 font-medium"
            >
              ← Kembali
            </button>
            <h1 className="text-3xl font-bold text-emerald-800">{eskulName}</h1>
            <p className="text-emerald-600">{today}</p>
          </div>
        </div>

        {/* Main Presensi Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-emerald-100"
        >
          <div className="mb-8">
            <p className="text-emerald-600 font-medium mb-2">Siswa:</p>
            <p className="text-2xl font-semibold text-emerald-800">{userInfo.name}</p>
          </div>

          <div className="mb-8">
            <p className="text-emerald-600 font-medium mb-4">Pilih Status Kehadiran:</p>
            <div className="grid grid-cols-3 gap-4">
              {/* HADIR */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedStatus('hadir')
                  setKeterangan('')
                }}
                className={`py-6 rounded-2xl font-semibold text-lg transition-all ${
                  selectedStatus === 'hadir'
                    ? 'bg-green-500 text-white shadow-lg scale-105'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                ✓ HADIR
              </motion.button>

              {/* SAKIT */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedStatus('sakit')
                  setKeterangan('')
                }}
                className={`py-6 rounded-2xl font-semibold text-lg transition-all ${
                  selectedStatus === 'sakit'
                    ? 'bg-yellow-500 text-white shadow-lg scale-105'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                🤒 SAKIT
              </motion.button>

              {/* IZIN */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatus('izin')}
                className={`py-6 rounded-2xl font-semibold text-lg transition-all ${
                  selectedStatus === 'izin'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                🙏 IZIN
              </motion.button>
            </div>
          </div>

          {/* Keterangan Izin */}
          {selectedStatus === 'izin' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <label className="text-emerald-600 font-medium mb-3 block">
                Keterangan Izin:
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Sakit gigi, Acara keluarga, dll..."
                className="w-full border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl px-5 py-4 text-base focus:outline-none resize-none"
                rows={4}
              />
              <p className="text-sm text-emerald-600 mt-2">
                *Jelaskan alasan izin Anda dengan singkat
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitted && !selectedStatus}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              submitted
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
            }`}
          >
            {submitted ? '✅ Presensi Tersimpan' : 'Simpan Presensi'}
          </motion.button>
        </motion.div>

        {/* Riwayat */}
        {riwayat.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800 mb-6">Riwayat Presensi</h2>
            <div className="space-y-3">
              {riwayat.map((item, idx) => {
                const statusColor = {
                  hadir: 'bg-green-100 text-green-700',
                  sakit: 'bg-yellow-100 text-yellow-700',
                  izin: 'bg-blue-100 text-blue-700'
                }
                const statusIcon = {
                  hadir: '✓',
                  sakit: '🤒',
                  izin: '🙏'
                }
                const statusLabel = {
                  hadir: 'Hadir',
                  sakit: 'Sakit',
                  izin: 'Izin'
                }

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
                  >
                    <div className="flex-1">
                      <p className="text-emerald-600 font-medium">
                        {new Date(item.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {item.keterangan && (
                        <p className="text-sm text-emerald-600 mt-1">
                          Keterangan: {item.keterangan}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        statusColor[item.status]
                      }`}
                    >
                      {statusIcon[item.status]} {statusLabel[item.status]}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => {
              setShowSuccessModal(false)
              router.back()
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-linear-to-br from-green-100 to-green-50 rounded-3xl p-8 max-w-md mx-4 text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">✓</span>
              </motion.div>

              <h2 className="text-3xl font-bold text-green-700 mb-2">
                Presensi Hari Ini Berhasil!
              </h2>

              <p className="text-green-600 mb-8 text-sm leading-relaxed">
                Trimakasih Sudah Presensi Hari Ini, Jangan Lupa Untuk Presensi Lagi ... See U
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSuccessModal(false)
                  router.back()
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Kembali
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileNavbar>
  )
}
