import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface OvertimeRecord {
  id: string
  employee_name: string
  date: string
  hours: number
  created_at: string
  enter_time: string
  exit_time: string
  entrances: string
  overtype: string
  is_uploaded: boolean

}

export default function SupervisorPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
const [filterDate, setFilterDate] = useState({ from: '', to: '' })
const [filterType, setFilterType] = useState('')
const [filterUploaded, setFilterUploaded] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('overtime')
        .select('*')
        .order('date', { ascending: false })
      if (data) setRecords(data)
      setLoading(false)
    }
    fetchData()
  }, [])

const exportExcel = async () => {
  const wb = new ExcelJS.Workbook()

  // ── معلومات الملف ──
  wb.creator       = 'نظام الأوفر تايم'
  wb.lastModifiedBy = 'المشرف'
  wb.created       = new Date()
  wb.modified      = new Date()

  // ── إنشاء الشيت بـ RTL ──
  const ws = wb.addWorksheet('الأوفر تايم', {
    views: [{ rightToLeft: true }],
    properties: { tabColor: { argb: '2563EB' } }
  })

  // ── عرض الأعمدة ──
  ws.columns = [
    { key: 'employee_name', width: 22 },
    { key: 'date',          width: 14 },
    { key: 'hours',         width: 10 },
    { key: 'enter_time',    width: 14 },
    { key: 'exit_time',     width: 14 },
    { key: 'entrances',     width: 12 },
    { key: 'overtype',      width: 18 },
  ]

  // ── الهيدر ──
  const headers = ['اسم الموظف','التاريخ','الساعات','بصمة الدخول','بصمة الخروج','الادخاليات','نوع العمل','حالة الرفع']
  const headerRow = ws.addRow(headers)
  headerRow.height = 28
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFF' }, name: 'Arial', size: 11 }
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border    = { top: { style: 'thin', color: { argb: 'FFFFFF' } }, bottom: { style: 'thin', color: { argb: 'FFFFFF' } }, left: { style: 'thin', color: { argb: 'FFFFFF' } }, right: { style: 'thin', color: { argb: 'FFFFFF' } } }
  })

  // ── البيانات ──
  filtered.forEach((r, i) => {
    const row = ws.addRow([
      r.employee_name,
      r.date,
      r.hours,
      formatTime(r.enter_time),
      formatTime(r.exit_time),
      r.entrances,
      r.overtype,
      r.is_uploaded
    ])
    const bgColor = i % 2 === 0 ? 'F9FAFB' : 'FFFFFF'
    row.eachCell(cell => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.font      = { name: 'Arial', size: 10 }
      cell.border    = { top: { style: 'thin', color: { argb: 'E5E7EB' } }, bottom: { style: 'thin', color: { argb: 'E5E7EB' } }, left: { style: 'thin', color: { argb: 'E5E7EB' } }, right: { style: 'thin', color: { argb: 'E5E7EB' } } }
    })
  })

  // ── تصدير ──
  const buf = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buf]), 'overtime.xlsx')
}

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

const formatTime = (time: string) => {
  if (!time) return ''
  const [hourStr, minute] = time.split(':')
  let hour = parseInt(hourStr)
  const period = hour >= 12 ? 'م' : 'ص'
  if (hour > 12) hour -= 12
  if (hour === 0) hour = 12
  return `${hour}:${minute} ${period}`
}

// دالة الفلترة
const filtered = records.filter(r => {
  const matchSearch = r.employee_name.includes(search) || r.overtype.includes(search)
  const matchFrom   = !filterDate.from || r.date >= filterDate.from
  const matchTo     = !filterDate.to   || r.date <= filterDate.to
  const matchType   = !filterType      || r.overtype === filterType
  const matchUpload = filterUploaded === '' || String(r.is_uploaded) === filterUploaded
  return matchSearch && matchFrom && matchTo && matchType && matchUpload
})

const resetFilters = () => {
  setSearch('')
  setFilterDate({ from: '', to: '' })
  setFilterType('')
  setFilterUploaded('')
}
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">سجل الأوفر تايم</h1>
          <div className="flex gap-3">
            <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              تصدير لملف اكسل
            </button>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">خروج</button>
          </div>
        </div>
{/* شريط الفلترة */}
<div className="bg-white rounded-xl shadow p-4 mb-4 space-y-3">
  
  {/* البحث */}
  <input
    type="text"
    placeholder="🔍 بحث باسم الموظف أو نوع العمل..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {/* من تاريخ */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">من تاريخ</label>
      <input
        type="date"
        value={filterDate.from}
        onChange={e => setFilterDate({ ...filterDate, from: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* إلى تاريخ */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">إلى تاريخ</label>
      <input
        type="date"
        value={filterDate.to}
        onChange={e => setFilterDate({ ...filterDate, to: e.target.value })}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* نوع العمل */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">نوع العمل</label>
      <select
        value={filterType}
        onChange={e => setFilterType(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">الكل</option>
        {['يوم عادي','يوم التأسيس','اليوم الوطني','يوم عيد الفطر','يوم عيد الاضحى','يوم اجازة رسمية للموظف'].map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>

    {/* حالة الرفع */}
    <div>
      <label className="block text-xs text-gray-500 mb-1">حالة الرفع</label>
      <select
        value={filterUploaded}
        onChange={e => setFilterUploaded(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">الكل</option>
        <option value="true">✅ تم الرفع</option>
        <option value="false">❌ لم يُرفع</option>
      </select>
    </div>
  </div>

  {/* نتائج + إعادة تعيين */}
  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
    <span>عدد النتائج: <strong className="text-gray-800">{filtered.length}</strong> من {records.length}</span>
    <button onClick={resetFilters} className="text-blue-500 hover:underline">إعادة تعيين</button>
  </div>
</div>
        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-right">اسم الموظف</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">الساعات</th>
                  <th className="px-4 py-3 text-right">بصمة الدخول</th>
                  <th className="px-4 py-3 text-right">بصمة الخروج</th>
                  <th className="px-4 py-3 text-right">الادخاليات</th>
                  <th className="px-4 py-3 text-right">نوع العمل الاضافي</th>
                  <th className="px-4 py-3 text-right">حالة الرفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.employee_name}</td>
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3">{r.hours} ساعة</td>
                    <td className="px-4 py-3">{formatTime(r.enter_time)}</td>
                    <td className="px-4 py-3">{formatTime(r.exit_time)}</td>
                    <td className="px-4 py-3">{r.entrances}</td>
                    <td className="px-4 py-3">{r.overtype}</td>
                    <td className="px-4 py-3 text-center">
                    {r.is_uploaded
                    ? <span className="text-green-600 font-medium">✅ تم الرفع</span>
                    : <span className="text-red-500 font-medium">❌ لم يُرفع</span>
                    }
</td>
                    
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-400">لا توجد بيانات</td></tr>
                )}
              </tbody>
            </table>
            
          </div>
        )}
      </div>
    </div>
  )
}