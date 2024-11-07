'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
    const { user, error, isLoading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/api/auth/login')
        }
    }, [user, isLoading, router])

    if (isLoading) return <div>Carregando...</div>
    if (error) return <div>Erro: {error.message}</div>
    if (!user) return null

    return <Dashboard />
}