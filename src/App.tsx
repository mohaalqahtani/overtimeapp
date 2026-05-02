import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Login from './pages/Login'
import AdminPage from './pages/AdminPage'
import SupervisorPage from './pages/SupervisorPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const [session, setSession] = useState<any>(undefined)
  const [role, setRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(false)

  const fetchRole = async (userId: string) => {
    setRoleLoading(true)
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()
    setRole(data?.role ?? null)
    setRoleLoading(false)
  }

  useEffect(() => {
    // قراءة الـ session عند أول تحميل
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        fetchRole(data.session.user.id)
      } else {
        setSession(null)
      }
    })

    // مراقبة أي تغيير في الـ session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s?.user) {
        fetchRole(s.user.id)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // لسا ما تحمّل
  if (session === undefined || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        جاري التحميل...
      </div>
    )
  }

  const homeRedirect = () => {
    if (!session) return <Login />
    if (role === 'admin') return <Navigate to="/admin" />
    if (role === 'supervisor') return <Navigate to="/supervisor" />
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={homeRedirect()} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
        <Route path="/supervisor" element={
          <ProtectedRoute allowedRole="supervisor">
            <SupervisorPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}