import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [form, setForm] = useState({ employee_name: '', date: '', hours: '', enter_time: '', exit_time: '', entrances: '', overtype: '' })
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
      enter_time: form.enter_time,
      exit_time: form.exit_time,
      entrances: form.entrances,
      overtype: form.overtype
    })

    if (error) setMessage('حدث خطأ، حاول مرة ثانية')
    else {
      setMessage('تمت الإضافة بنجاح ✅')
      setForm({ employee_name: '', date: '', hours: '', enter_time: '', exit_time: '', entrances: '', overtype: '' })
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
              step="1"
              min="1"
              max="24"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

            <div>
            <label className="block text-sm text-gray-600 mb-1">بصمة الدخول</label>
            <div className="flex gap-2">
                <input
                type="time"
                value={form.enter_time}
                onChange={e => setForm({ ...form, enter_time: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            </div>

            <div>
            <label className="block text-sm text-gray-600 mb-1">بصمة الخروج</label>
            <div className="flex gap-2">
                <input
                type="time"
                value={form.exit_time}
                onChange={e => setForm({ ...form, exit_time: e.target.value })}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">الادخاليات</label>
            <input
              type="number"
              value={form.entrances}
              onChange={e => setForm({ ...form, entrances: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

            <div>
            <label className="block text-sm text-gray-600 mb-1">نوع العمل الاضافي</label>
            <input
              type="text"
              value={form.overtype}
              onChange={e => setForm({ ...form, overtype: e.target.value })}
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