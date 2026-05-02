import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

interface Props {
  children: React.ReactNode
  allowedRole: 'admin' | 'supervisor'
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading')

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setStatus('denied')

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (data?.role === allowedRole) setStatus('allowed')
      else setStatus('denied')
    }
    check()
  }, [allowedRole])

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-gray-500">جاري التحقق...</div>
  if (status === 'denied') return <Navigate to="/" />
  return <>{children}</>
}