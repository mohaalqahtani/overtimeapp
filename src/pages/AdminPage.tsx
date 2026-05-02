import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface OvertimeRecord {
  id: string
  employee_name: string
  date: string
  hours: number
  enter_time: string
  exit_time: string
  entrances: number
  overtype: string
  is_uploaded: boolean
}

export default function AdminPage() {
  const [tab, setTab] = useState<'add' | 'records'>('add')
  const [form, setForm] = useState({ employee_name: '', date: '', hours: '', enter_time: '', exit_time: '', entrances: '', overtype: '' })
  const [records, setRecords] = useState<OvertimeRecord[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<OvertimeRecord>>({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const overtimeTypes = ['يوم عادي','يوم التأسيس','اليوم الوطني','يوم عيد الفطر','يوم عيد الاضحى','يوم اجازة رسمية للموظف']

  // جلب السجلات
  const fetchRecords = async () => {
    const { data } = await supabase.from('overtime').select('*').order('date', { ascending: false })
    if (data) setRecords(data)
  }

  useEffect(() => { fetchRecords() }, [])

  // إضافة سجل
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('overtime').insert({
      ...form,
      hours: parseFloat(form.hours),
      entrances: parseFloat(form.entrances),
      added_by: user?.id,
      is_uploaded: false,
    })
    if (error) setMessage('حدث خطأ، حاول مرة ثانية')
    else {
      setMessage('تمت الإضافة بنجاح ✅')
      setForm({ employee_name: '', date: '', hours: '', enter_time: '', exit_time: '', entrances: '', overtype: '' })
      fetchRecords()
    }
    setLoading(false)
  }

  // حفظ التعديل
  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase.from('overtime').update(editForm).eq('id', id)
    if (!error) { setEditingId(null); fetchRecords() }
  }

  // حذف سجل
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    await supabase.from('overtime').delete().eq('id', id)
    fetchRecords()
  }

  // تبديل حالة الرفع
  const toggleUploaded = async (id: string, current: boolean) => {
    await supabase.from('overtime').update({ is_uploaded: !current }).eq('id', id)
    fetchRecords()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const parts = time.split(':')
    if (parts.length < 2) return time
    let hour = parseInt(parts[0])
    const minute = parts[1].padStart(2, '0')
    const period = hour >= 12 ? 'م' : 'ص'
    if (hour > 12) hour -= 12
    if (hour === 0) hour = 12
    return `${hour}:${minute} ${period}`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* الهيدر */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">لوحة الأدمن</h1>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">خروج</button>
        </div>

        {/* التبويبات */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('add')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'add' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            ➕ إضافة سجل
          </button>
          <button
            onClick={() => setTab('records')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tab === 'records' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            📋 السجلات ({records.length})
          </button>
        </div>

        {/* تبويب الإضافة */}
        {tab === 'add' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-lg">
            {message && <p className={`text-sm text-center ${message.includes('خطأ') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}

            {[
              { label: 'اسم الموظف', key: 'employee_name', type: 'text' },
              { label: 'التاريخ',    key: 'date',          type: 'date' },
              { label: 'عدد الساعات', key: 'hours',        type: 'number' },
              { label: 'بصمة الدخول', key: 'enter_time',  type: 'time' },
              { label: 'بصمة الخروج', key: 'exit_time',   type: 'time' },
              { label: 'الادخاليات',  key: 'entrances',   type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}

            <div>
              <label className="block text-sm text-gray-600 mb-1">نوع العمل الاضافي</label>
              <select
                value={form.overtype}
                onChange={e => setForm({ ...form, overtype: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- اختر النوع --</option>
                {overtimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </form>
        )}

        {/* تبويب السجلات */}
        {tab === 'records' && (
            <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  {['اسم الموظف','التاريخ','الساعات','دخول','خروج','الادخاليات','النوع','الرفع','إجراءات'].map(h => (
                    <th key={h} className="px-3 py-3 text-right whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    {editingId === r.id ? (
                      <>
                        <td className="px-2 py-2"><input value={editForm.employee_name ?? ''} onChange={e => setEditForm({...editForm, employee_name: e.target.value})} className="border rounded px-2 py-1 w-28 text-sm" /></td>
                        <td className="px-2 py-2"><input type="date" value={editForm.date ?? ''} onChange={e => setEditForm({...editForm, date: e.target.value})} className="border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-2 py-2"><input type="number" value={editForm.hours ?? ''} onChange={e => setEditForm({...editForm, hours: parseFloat(e.target.value)})} className="border rounded px-2 py-1 w-16 text-sm" /></td>
                        <td className="px-2 py-2"><input type="time" value={editForm.enter_time ?? ''} onChange={e => setEditForm({...editForm, enter_time: e.target.value})} className="border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-2 py-2"><input type="time" value={editForm.exit_time ?? ''} onChange={e => setEditForm({...editForm, exit_time: e.target.value})} className="border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-2 py-2"><input type="number" value={editForm.entrances ?? ''} onChange={e => setEditForm({...editForm, entrances: parseFloat(e.target.value)})} className="border rounded px-2 py-1 w-20 text-sm" /></td>
                        <td className="px-2 py-2">
                          <select value={editForm.overtype ?? ''} onChange={e => setEditForm({...editForm, overtype: e.target.value})} className="border rounded px-2 py-1 text-sm">
                            {overtimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2 text-center">{r.is_uploaded ? '✅' : '❌'}</td>
                        <td className="px-2 py-2 flex gap-1">
                          <button onClick={() => handleSaveEdit(r.id)} className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">حفظ</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400">إلغاء</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3">{r.employee_name}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{r.date}</td>
                        <td className="px-3 py-3">{r.hours}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatTime(r.enter_time)}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatTime(r.exit_time)}</td>
                        <td className="px-3 py-3">{r.entrances}</td>
                        <td className="px-3 py-3 whitespace-nowrap">{r.overtype}</td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => toggleUploaded(r.id, r.is_uploaded)} className="text-lg hover:scale-125 transition-transform" title="اضغط للتبديل">
                            {r.is_uploaded ? '✅' : '❌'}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingId(r.id); setEditForm(r) }} className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">تعديل</button>
                            <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">حذف</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">لا توجد سجلات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}