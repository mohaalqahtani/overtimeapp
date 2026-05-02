import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [form, setForm] = useState({ employee_name: '', date: '', hours: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('overtime').insert({
      employee_name: form.employee_name,
      date: form.date,
      hours: parseFloat(form.hours),
      added_by: user?.id,
    })

    if (error) setMessage('حدث خطأ، حاول مرة ثانية')
    else {
      setMessage('تمت الإضافة بنجاح ✅')
      setForm({ employee_name: '', date: '', hours: '' })
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">إضافة أوفر تايم</h1>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">خروج</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          {message && <p className={`text-sm text-center ${message.includes('خطأ') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}

          <div>
            <label className="block text-sm text-gray-600 mb-1">اسم الموظف</label>
            <input
              type="text"
              value={form.employee_name}
              onChange={e => setForm({ ...form, employee_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">التاريخ</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">عدد الساعات</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>
      </div>
    </div>
  )
}