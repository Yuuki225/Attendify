/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import MobileNavbar from '@/components/MobileNavbar'
import Image from 'next/image'

type Eskul = {
  id: number
  nama: string
  status: string
}

type Murid = {
  id: string
  nis: string
  full_name: string
}

type Rekap = {
  hadir: number
  sakit: number
  izin: number
  total: number
}

type PresensiDetail = {
  siswa_id: string
  status: 'hadir' | 'sakit' | 'izin'
  keterangan?: string
  tanggal: string
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

export default function GuruDashboardPage() {
  const [eskulList, setEskulList] = useState<Eskul[]>([])
  const [selectedEskul, setSelectedEskul] = useState<Eskul | null>(null)
  const [muridList, setMuridList] = useState<Murid[]>([])
  const [rekapData, setRekapData] = useState<Record<string, Rekap>>({})
  const [presensiDetails, setPresensiDetails] = useState<Record<string, PresensiDetail[]>>({})
  const [allSiswa, setAllSiswa] = useState<Murid[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRekapModal, setShowRekapModal] = useState(false)
  const [selectedMurid, setSelectedMurid] = useState<Murid | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: eskulData, error: eskulError } = await supabase
          .from('eskul')
          .select('*')
          .order('nama')

        if (eskulError) {
        } else if (eskulData) {
          setEskulList(eskulData)
        }

        const siswaResponse = await fetch('/api/get-siswa')
        const siswaJson = await siswaResponse.json()

        if (siswaJson.success && siswaJson.data && siswaJson.data.length > 0) {
          const formatted = siswaJson.data.map((s: any) => ({
            id: s.id,
            nis: s.nis_nip || '',
            full_name: s.full_name || ''
          }))
          setAllSiswa(formatted)
        } else {
          setAllSiswa([])
        }
      } catch (error) {
        setAllSiswa([])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const loadMuridDanRekap = async (eskul: Eskul) => {
    setSelectedEskul(eskul)
    setLoading(true)

    try {
      const response = await fetch(`/api/get-murid-by-eskul?eskul_id=${eskul.id}`)
      const json = await response.json()

      if (!json.success || !json.data || json.data.length === 0) {
        setMuridList([])
        setRekapData({})
        setLoading(false)
        return
      }

      const murid = json.data.map((p: any) => ({
        id: p.id,
        nis: p.nis_nip || '',
        full_name: p.full_name || ''
      }))


      setMuridList(murid)

      const presensiData = json.presensiData || []
      const rekapTemp: Record<string, Rekap> = {}
      const presensiDetailsTemp: Record<string, PresensiDetail[]> = {}

      for (const m of murid) {
        const muridPresensi = presensiData.filter((p: any) => p.siswa_id === m.id)
        const counts = {
          hadir: muridPresensi.filter((p: any) => p.status === 'hadir').length,
          sakit: muridPresensi.filter((p: any) => p.status === 'sakit').length,
          izin: muridPresensi.filter((p: any) => p.status === 'izin').length,
          total: muridPresensi.length,
        }
        rekapTemp[m.id] = counts
        presensiDetailsTemp[m.id] = muridPresensi
      }

      setRekapData(rekapTemp)
      setPresensiDetails(presensiDetailsTemp)
    } catch (err) {
      setMuridList([])
      setRekapData({})
      setPresensiDetails({})
    } finally {
      setLoading(false)
    }
  }

  const handleTambahMurid = async (selectedMurids: Murid[]) => {
    if (!selectedEskul) return

    try {
      const inserts = selectedMurids.map(murid => ({
        siswa_id: murid.id,
        eskul_id: selectedEskul.id,
      }))

      console.log('📝 Menambahkan murid via API:', inserts)

      const results = []
      let newCount = 0
      let alreadyCount = 0

      for (const insert of inserts) {
        const response = await fetch('/api/add-siswa-ke-eskul', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insert)
        })

        const result = await response.json()
        results.push(result)

        if (result.success) {
          if (result.isAlreadyRegistered) {
            console.log(`ℹ️ Siswa sudah terdaftar: ${insert.siswa_id}`)
            alreadyCount++
          } else {
            console.log(`✅ Berhasil tambah siswa ${insert.siswa_id}`)
            newCount++
          }
        } else {
          console.error(`❌ Gagal tambah siswa ${insert.siswa_id}:`, result.error)
        }
      }

      const hasSuccess = results.some(r => r.success)

      if (hasSuccess) {
        let message = `✅ `
        if (newCount > 0) {
          message += `${newCount} murid baru berhasil ditambahkan`
        }
        if (alreadyCount > 0) {
          message += (newCount > 0 ? ' dan ' : '') + `${alreadyCount} murid sudah terdaftar`
        }
        message += ` ke ${selectedEskul.nama}`

        alert(message)
        setShowAddModal(false)
        setSearchTerm('')
        loadMuridDanRekap(selectedEskul) // refresh data
      } else {
        const failed = results.filter(r => !r.success).length
        alert(`⚠️ ${failed} dari ${selectedMurids.length} murid gagal ditambahkan.\n\nLihat console untuk detail error.`)
      }
    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      alert('❌ Error: ' + err.message)
    }
  }

  const openRekap = (murid: Murid) => {
    setSelectedMurid(murid)
    setShowRekapModal(true)
  }

  if (loading && !selectedEskul) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-emerald-700">Memuat Dashboard Guru...</div>
  }

  return (
    <MobileNavbar role="guru">
      <div className="max-w-7xl mx-auto px-6 pt-8">
          {!selectedEskul && (
            <>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-emerald-800 mb-6">
                Pilih Eskul yang Ingin Dikelola
              </motion.h2>
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                {eskulList.map((eskul) => (
                  <motion.div
                    key={eskul.id}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 20 },
                      visible: { opacity: 1, scale: 1, y: 0 },
                    }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadMuridDanRekap(eskul)}
                    className="bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all"
                  >
                    <div className="w-full h-40 bg-gradient-to-br from-[#A8E8C2] to-[#7dd3c0] flex items-center justify-center overflow-hidden">
                      <Image
                        src={`/asset/${getEskulImage(eskul.nama)}`}
                        alt={eskul.nama}
                        width={200}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-emerald-800">{eskul.nama}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-3 h-3 rounded-full ${eskul.status?.toLowerCase() === 'aktif' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-emerald-600">{eskul.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {selectedEskul && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedEskul(null)}
                      className="text-emerald-600 hover:text-emerald-800 flex items-center gap-2 text-lg"
                    >
                      ← Kembali
                    </button>
                    <h2 className="text-3xl font-bold text-emerald-800">{selectedEskul.nama}</h2>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-3xl font-semibold flex items-center gap-3 shadow-lg"
                  >
                    + Tambah Murid ke Eskul
                  </motion.button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-emerald-50">
                      <tr>
                        <th className="text-left py-6 px-8 font-semibold text-emerald-700">NIS</th>
                        <th className="text-left py-6 px-8 font-semibold text-emerald-700">Nama Murid</th>
                        <th className="text-center py-6 px-8 font-semibold text-emerald-700">Hadir</th>
                        <th className="text-center py-6 px-8 font-semibold text-emerald-700">Sakit</th>
                        <th className="text-center py-6 px-8 font-semibold text-emerald-700">Izin</th>
                        <th className="text-center py-6 px-8 font-semibold text-emerald-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {muridList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-emerald-600">
                            Belum ada murid yang terdaftar di eskul ini
                          </td>
                        </tr>
                      ) : (
                        muridList.map((murid) => {
                          const rekap = rekapData[murid.id] || { hadir: 0, sakit: 0, izin: 0, total: 0 }
                          return (
                            <tr key={murid.id} className="border-t hover:bg-emerald-50 transition-colors">
                              <td className="py-6 px-8 font-medium text-emerald-800">{murid.nis}</td>
                              <td className="py-6 px-8 font-medium text-emerald-800">{murid.full_name}</td>
                              <td className="text-center py-6 px-8">
                                <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-2xl font-semibold">{rekap.hadir}</span>
                              </td>
                              <td className="text-center py-6 px-8">
                                <span className="inline-block bg-red-100 text-red-700 px-4 py-1 rounded-2xl font-semibold">{rekap.sakit}</span>
                              </td>
                              <td className="text-center py-6 px-8">
                                <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-1 rounded-2xl font-semibold">{rekap.izin}</span>
                              </td>
                              <td className="text-center py-6 px-8">
                                <button
                                  onClick={() => openRekap(murid)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold"
                                >
                                  Lihat Detail Rekap
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-100"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-2xl w-full mx-4 overflow-hidden"
              >
                <div className="p-8 border-b">
                  <h3 className="text-2xl font-semibold text-emerald-800">Tambah Murid ke {selectedEskul?.nama}</h3>
                  <input
                    type="text"
                    placeholder="Cari nama atau NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mt-6 border-2 border-emerald-200 focus:border-emerald-500 rounded-2xl px-6 py-5"
                  />
                </div>

                <div className="max-h-105 overflow-auto p-4">
                  {allSiswa.length === 0 ? (
                    <div className="text-center py-12 text-emerald-600">
                      <p className="text-lg mb-2">Tidak ada siswa tersedia</p>
                      <p className="text-sm">Pastikan sudah ada siswa dengan role siswa di database</p>
                    </div>
                  ) : (
                    allSiswa
                      .filter((siswa) => {
                        if (searchTerm === '') {
                          return !muridList.some((m) => m.id === siswa.id)
                        }
                        return (
                          !muridList.some((m) => m.id === siswa.id) &&
                          (siswa.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            siswa.nis.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                      })
                      .map((siswa) => (
                        <div
                          key={siswa.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-emerald-50 rounded-2xl mx-2"
                        >
                          <div>
                            <div className="font-semibold text-emerald-800">{siswa.full_name}</div>
                            <div className="text-emerald-600 text-sm">NIS: {siswa.nis}</div>
                          </div>
                          <button
                            onClick={() => handleTambahMurid([siswa])}
                            className="bg-emerald-500 text-white px-7 py-3 rounded-2xl text-sm font-medium hover:bg-emerald-600"
                          >
                            Daftarkan
                          </button>
                        </div>
                      ))
                  )}
                </div>

                <div className="p-6 border-t flex justify-end gap-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-8 py-4 text-emerald-700 font-medium"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRekapModal && selectedMurid && selectedEskul && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-100"
              onClick={() => setShowRekapModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-lg w-full mx-4 p-8"
              >
                <h3 className="text-2xl font-semibold text-emerald-800 mb-2">{selectedMurid.full_name}</h3>
                <p className="text-emerald-600">Rekap Presensi • {selectedEskul.nama}</p>

                <div className="grid grid-cols-3 gap-6 mt-10">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600">{rekapData[selectedMurid.id]?.hadir || 0}</div>
                    <div className="text-green-700 font-medium mt-2">Hadir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-600">{rekapData[selectedMurid.id]?.sakit || 0}</div>
                    <div className="text-red-700 font-medium mt-2">Sakit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-600">{rekapData[selectedMurid.id]?.izin || 0}</div>
                    <div className="text-yellow-700 font-medium mt-2">Izin</div>
                  </div>
                </div>

                <div className="mt-12 text-center text-emerald-600">
                  Total Pertemuan: <span className="font-semibold text-emerald-800">{rekapData[selectedMurid.id]?.total || 0}</span>
                </div>

                {rekapData[selectedMurid.id]?.izin > 0 && (
                  <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-3">Keterangan Izin:</h4>
                    <div className="space-y-2">
                      {presensiDetails[selectedMurid.id]
                        ?.filter((p) => p.status === 'izin')
                        .map((presensi, idx) => (
                          <div key={idx} className="text-sm text-yellow-700">
                            <p className="font-medium">{new Date(presensi.tanggal).toLocaleDateString('id-ID')}</p>
                            <p className="text-yellow-600">{presensi.keterangan || 'Tidak ada keterangan'}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowRekapModal(false)}
                  className="mt-10 w-full bg-emerald-500 text-white py-6 rounded-3xl font-semibold text-lg"
                >
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </MobileNavbar>
    )
}