'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faClock,
  faCircleCheck,
  faArrowRightToBracket,
  faArrowRightFromBracket
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { showConfirm, showInfo, showSuccess } from '@/lib/sweetalert';

interface session {
  success: Boolean,
  userId: Number,
}
interface config {
  nama_perusahaan?: String,
  alamat_perusahaan?: any,
  no_telp_perusahaan?: any,
  email_perusahaan?: any,
  jam_masuk?: any,
  jam_pulang?: any,
  toleransi_telat?: any
}
interface history {
  hadir: Number,
  terlambat: Number,
  history: Array<{
    absen_masuk: any | 0,
    absen_keluar: any | 0,
    tanggal: any,
    status: String
  }>
}

export default function PegawaiDashboard() {
  const [jamMasuk, setJamMasuk] = useState<string | null>(null);
  const [jamKeluar, setJamKeluar] = useState<string | null>(null);
  const [configData, SetConfigData] = useState<config>();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [Sessions, setSession] = useState<session | null>(null)
  const [absenhistory, setabsenhistory] = useState<history | null>();
  useEffect(() => {
    storesession()
    configfetch()
  }, [])
  const storesession = async () => {
    try {
      const session = await fetch('/api/auth/session')
      const sessionresult = await session.json()
      if (sessionresult.success) {
        setSession(sessionresult)
        setabsen(sessionresult.userId)
        getstats(Number(sessionresult.userId))
      }
    } catch (e) {
      console.log(e)
    }
  }
  const configfetch = async () => {
    try {
      const checktime = await fetch('/api/karyawan/config')
      const checktimeresult = await checktime.json()
      const config = checktimeresult.result[0]
      SetConfigData(config)
    }
    catch (e) {
      console.log(e)
    }
  }
  const cektelat = (time: string, menit_toleransi: number) => {
    const [h, m, s] = time.split(':').map(Number);
    const addMinutes = menit_toleransi;

    const totalMinutes = h * 60 + m + addMinutes;

    const newH = Math.floor(totalMinutes / 60);
    const newM = totalMinutes % 60;

    return `${String(newH).padStart(2, '0')}.${String(newM).padStart(2, '0')}.${String(s).padStart(2, '0')}`;
  };
  const setabsen = async (id: Number) => {
    try {
      const absendata = await fetch('/api/karyawan/absen', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          requests: 'fetch'
        })
      }

      )
      const absendatas = await absendata.json()
      if (absendatas.success) {
        setJamMasuk(absendatas.result[0].absen_masuk.substring(0, 5).replace(':', '.'))
        setJamKeluar(absendatas.result[0].absen_keluar.substring(0, 5).replace(':', '.'))
        // console.log(absendatas.result)
      }
    } catch (e) {
      console.log(e)
    }
  }
  const getstats = async (id: number) => {
    try {
      const absendata = await fetch('/api/karyawan/absen', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          requests: 'fetch_all'
        })
      }

      )
      const absendatas = await absendata.json()
      console.log(absendatas)
      setabsenhistory(absendatas.result)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      setCurrentDate(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAbsen = async () => {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', });

    if (!jamMasuk) {
      setJamMasuk(time);
      const islate:boolean = toMinutes(time) > toMinutes(cektelat(configData && configData.jam_masuk, configData && configData.toleransi_telat))
      const inputtodb = await fetch('/api/karyawan/absen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Sessions?.userId,
          absen_masuk: time,
          status: islate ? 'terlambat' : 'hadir',
          requests: 'jam_masuk'
        })
      }
      )
      const resultinputtodb = await inputtodb.json()
      // console.log(resultinputtodb)
      // console.log(time)
      // console.log(islate)
      await showSuccess('Absen Masuk Berhasil!', `Tercatat pada ${time}`);
    } else if (!jamKeluar) {
      if ((await showConfirm('Konfirmasi', 'Apakah anda yakin untuk ceklog pulang?')).isConfirmed) {
        setJamKeluar(time);
        const inputtodbkl = await fetch('/api/karyawan/absen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: Sessions?.userId,
            absen_keluar: time,
            requests: 'jam_keluar'
          })
        }
        )
        const resultinputtodbkl = await inputtodbkl.json()
        // console.log(resultinputtodbkl)
        // console.log(time)
        await showSuccess('Absen Keluar Berhasil!', `Tercatat pada ${time}`);
      }
    }
  };

  const getStatusButton = () => {
    if (!jamMasuk) {
      return {
        text: 'Absen Masuk',
        icon: faArrowRightToBracket,
        disabled: false,
        bgColor: 'bg-gray-800 hover:bg-gray-900'
      };
    } else if (!jamKeluar) {
      return {
        text: 'Absen Keluar',
        icon: faArrowRightFromBracket,
        disabled: false,
        bgColor: 'bg-gray-800 hover:bg-gray-900'
      };
    } else {
      return {
        text: 'Absensi Selesai',
        icon: faCircleCheck,
        disabled: true,
        bgColor: 'bg-gray-400'
      };
    }
  };

  const buttonStatus = getStatusButton();
  const toMinutes = (time: string) => {
    const [h, m] = time.split('.').map(Number)
    return h * 60 + m
  }
  const getTimeColor = (time: string) => {
    if (!time) return 'text-gray-300'
    if (time == 'null') return 'text-gray-300'
    //console.log(time)

    return toMinutes(time) > toMinutes(cektelat(configData && configData.jam_masuk, configData && configData.toleransi_telat))
      ? 'text-red-500'
      : 'text-gray-800'
  }


  return (
    <div className="space-y-6">
      <div className='pt-12'>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Pegawai</h1>
        <p className="text-gray-600 mt-1">{currentDate}</p>
      </div>

      <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-4">
              <FontAwesomeIcon icon={faClock} className="text-3xl text-white" />
            </div> */}
            <div className="text-5xl font-bold text-gray-800 mb-2 tabular-nums">
              {currentTime}
            </div>
            <p className="text-gray-600 text-sm">Waktu Saat Ini</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Jam Masuk</span>
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  className={`text-lg ${jamMasuk ? 'text-gray-800' : 'text-gray-300'}`}
                />
              </div>
              <div className={`text-3xl font-bold ${getTimeColor(String(jamMasuk))}`}>
                {jamMasuk || '--:--'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Jam Keluar</span>
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className={`text-lg ${jamKeluar ? 'text-gray-800' : 'text-gray-300'}`}
                />
              </div>
              <div className={`text-3xl font-bold ${jamKeluar ? 'text-gray-800' : 'text-gray-300'}`}>
                {jamKeluar || '--:--'}
              </div>
            </div>
          </div>

          <button
            onClick={handleAbsen}
            disabled={buttonStatus.disabled}
            className={`w-full py-4 ${buttonStatus.bgColor} text-white rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-3`}
          >
            <FontAwesomeIcon icon={buttonStatus.icon} className="text-xl" />
            {buttonStatus.text}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Absensi Bulan Ini</p>
              <h3 className="text-3xl font-bold text-gray-800">{absenhistory && absenhistory?.hadir.toString()} Hari</h3>
            </div>
            <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Keterlambatan</p>
              <h3 className="text-3xl font-bold text-gray-800">{absenhistory && absenhistory?.terlambat.toString()} Kali</h3>
            </div>
            <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-2xl text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Riwayat Absensi Terbaru</h3>
          <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400" />
        </div>

        <div className="space-y-3">
          {absenhistory?.history.slice(0,5).map((i,index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div>
                <p className="font-medium text-gray-800">{new Date(i.tanggal).toLocaleDateString('id-ID',{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-gray-500 mt-1">{i.absen_masuk != null && String(i.absen_masuk).replaceAll(':','.').slice(0,5)} - {i.absen_keluar != null && String(i.absen_keluar).replaceAll(':','.').slice(0,5)}</p>
              </div>
              <span className="px-4 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-full capitalize">
                {i.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
