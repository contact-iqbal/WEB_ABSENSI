'use client'

import { useState } from "react"
import * as XLSX from 'xlsx';
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileUpload, faDatabase, faTable, faList, faEye, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";

export default function TestPage() {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>("");
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        selectSheet(wb, wb.SheetNames[0]);
      } catch (error) {
        console.error("Error parsing excel:", error);
        alert("Failed to parse Excel file.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const fetchDefaultFile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data.xls');
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        const defaultSheet = wb.SheetNames.find(n => n.match(/^[\d.]+$/)) || wb.SheetNames[0];
        selectSheet(wb, defaultSheet);
      };
      reader.readAsBinaryString(blob);
    } catch (error) {
      console.error("Error fetching default file:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectSheet = (wb: XLSX.WorkBook, name: string) => {
    setCurrentSheet(name);
    const sheet = wb.Sheets[name];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false }) as any[][];
    setSheetData(rawRows);
  };

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return null;
    const parts = timeStr.split(':');
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const smartImport = async () => {
    if (!workbook) return;
    setLoading(true);
    setImportStatus("Phase 0: Fetching Configuration...");
    
    try {
      // 0. Fetch Config
      const configRes = await fetch('/api/admin/config');
      const configData = await configRes.json();
      const config = configData.result?.[0] || {};
      const jamMasukMin = timeToMinutes(config.jam_masuk || "08:00");
      const toleransi = parseInt(config.toleransi_telat || "0");

      setImportStatus("Phase 1: Syncing Employees & Mapping IDs...");

      // 1. Fetch existing employees
      const empRes = await fetch('/api/admin/karyawan');
      const empData = await empRes.json();
      const existingEmployees = empData.result || [];
      const idSet = new Set(existingEmployees.map((e: any) => e.id));

      // 2. Identify unique employees in Excel
      const excelEmployees = new Map();
      const numericSheets = workbook.SheetNames.filter(name => name.match(/^[\d.]+$/));
      
      for (const sheetName of numericSheets) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false }) as any[][];
        const offsets = [0, 15, 30];
        offsets.forEach(offset => {
          const empIdExcel = String(rows[3]?.[offset + 9] || "").trim();
          const empName = String(rows[2]?.[offset + 9] || "").trim();
          const empDept = String(rows[2]?.[offset + 1] || "").trim();
          
          if (empIdExcel && empName && !isNaN(Number(empIdExcel)) && !empName.includes("Tabulasi") && empName !== "Nama") {
            excelEmployees.set(empIdExcel, { id: parseInt(empIdExcel), nama: empName, devisi: empDept });
          }
        });
      }

      // 3. Ensure all Excel employees exist in DB with their Excel IDs
      const empList = Array.from(excelEmployees.values());
      setProgress({ current: 0, total: empList.length });

      for (let i = 0; i < empList.length; i++) {
        const emp = empList[i];
        
        if (!idSet.has(emp.id)) {
          setImportStatus(`Creating employee ID ${emp.id}: ${emp.nama}...`);
          await fetch('/api/admin/karyawan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: "create",
              id: emp.id, // Use explicit Excel ID
              username: emp.nama.toLowerCase().replace(/\s+/g, '_'),
              password: "password123",
              nama: emp.nama,
              devisi: ['DNA', 'RT'].includes(emp.devisi) ? emp.devisi : 'default',
              status: "pegawai_tetap"
            })
          });
          idSet.add(emp.id);
        }
        setProgress({ current: i + 1, total: empList.length });
      }

      // 4. Import Attendance
      setImportStatus("Phase 2: Importing Attendance Records...");
      const attendanceData: any[] = [];
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

      for (const sheetName of numericSheets) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false }) as any[][];
        const dateRangeStr = String(rows[1]?.[3] || "");
        const match = dateRangeStr.match(/(\d{4})-(\d{2})-\d{2}/);
        const year = match ? match[1] : "2026";
        const month = match ? match[2] : "02";
        const offsets = [0, 15, 30];
        
        offsets.forEach(offset => {
          const empIdExcel = String(rows[3]?.[offset + 9] || "").trim();
          if (!empIdExcel || isNaN(Number(empIdExcel))) return;
          const realDbId = parseInt(empIdExcel);

          for (let i = 11; i < rows.length; i++) {
            const row = rows[i];
            const dateLabel = String(row[offset + 0] || "").trim();
            if (!dateLabel || !dateLabel.match(/^\d+/)) continue;

            const day = dateLabel.split(' ')[0].padStart(2, '0');
            const fullDate = `${year}-${month}-${day}`;
            
            let clockInRaw = String(row[offset + 1] || "").trim();
            let clockOutRaw = String(row[offset + 3] || "").trim();

            const clockIn = clockInRaw.match(timeRegex) ? clockInRaw : null;
            const clockOut = clockOutRaw.match(timeRegex) ? clockOutRaw : null;

            if (clockInRaw || clockOutRaw) {
              let status = "hadir";
              if (clockIn && jamMasukMin !== null) {
                const checkInMin = timeToMinutes(clockIn);
                if (checkInMin !== null && checkInMin > (jamMasukMin + toleransi)) {
                  status = "terlambat";
                }
              }

              attendanceData.push({
                karyawan_id: realDbId,
                tanggal: fullDate,
                absen_masuk: clockIn,
                absen_keluar: clockOut,
                status: status,
                keterangan: "Excel Import"
              });
            }
          }
        });
      }

      setImportStatus(`Importing ${attendanceData.length} records...`);
      setProgress({ current: 0, total: attendanceData.length });
      let successCount = 0;
      for (let i = 0; i < attendanceData.length; i++) {
        const record = attendanceData[i];
        try {
          const res = await fetch('/api/admin/absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...record, override: "" })
          });
          if (res.ok) successCount++;
        } catch (e) {}
        
        if (i % 25 === 0 || i === attendanceData.length - 1) {
          setProgress({ current: i + 1, total: attendanceData.length });
        }
      }

      setImportStatus(`Success! Imported ${successCount} attendance records.`);
    } catch (err) {
      console.error(err);
      setImportStatus("Error during import process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen-50 p-8 text-black">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="pt-6">
              <h1 className="text-3xl font-bold text-gray-800">Attendance Smart Import</h1>
              <p className="text-gray-500">Explicitly using Excel ID as Database ID for perfect matching</p>
            </div>
          </div>
          {workbook && (
            <button onClick={smartImport} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              {loading ? 'Processing...' : 'Final Sync & Import'}
            </button>
          )}
        </div>

        {importStatus && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-indigo-100 flex flex-col gap-4">
            <p className="text-sm font-semibold text-indigo-900">{importStatus}</p>
            {progress.total > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                </div>
                <span className="text-xs font-mono text-indigo-600 font-bold">{progress.current}/{progress.total}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faFileUpload} className="text-blue-500" /> Source</h2>
              <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} className="mb-4 text-xs w-full cursor-pointer file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
              <button onClick={fetchDefaultFile} className="w-full py-2 bg-gray-50 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">Load public/data.xls</button>
            </div>
            {sheetNames.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faList} className="text-purple-500" /> Sheets</h2>
                <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1">
                  {sheetNames.map(name => {
                    const isNumeric = name.match(/^[\d.]+$/);
                    return (
                      <button key={name} onClick={() => workbook && selectSheet(workbook, name)} className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${currentSheet === name ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-100 text-gray-600'}`}>
                        {name} {isNumeric && "(Absen_data)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-3">
            {sheetData.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Preview: {currentSheet}</h3>
                </div>
                <div className="overflow-auto max-h-[600px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 border-r text-[10px] bg-gray-100">#</th>
                        {Array.from({ length: Math.max(...sheetData.map(r => r.length), 0) }).map((_, i) => (
                          <th key={i} className="px-4 py-2 text-left text-[10px] uppercase font-bold text-gray-400">{XLSX.utils.encode_col(i)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {sheetData.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-3 py-2 text-[10px] bg-gray-50 border-r text-center text-gray-300">{rowIdx + 1}</td>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className={`px-4 py-2 whitespace-nowrap text-xs border-r ${cell ? 'text-gray-700 font-medium' : 'text-gray-200'}`}>{String(cell || '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Select a sheet to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
