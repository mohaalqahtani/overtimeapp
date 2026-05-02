import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface OvertimeRecord {
  id: string
  employee_name: string
  date: string
  hours: number
  created_at: string
}

export default function SupervisorPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [loading, setLoading] = useState(true)

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

  const exportCSV = () => {
    const header = ['اسم الموظف', 'التاريخ', 'الساعات']
    const rows = records.map(r => [r.employee_name, r.date, r.hours])
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'overtime.csv'
    a.click()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">سجل الأوفر تايم</h1>
          <div className="flex gap-3">
            <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              تصدير CSV
            </button>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">خروج</button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-right">اسم الموظف</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">الساعات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{r.employee_name}</td>
                    <td className="px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3">{r.hours} ساعة</td>
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