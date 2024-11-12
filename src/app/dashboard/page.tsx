/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in')
        }
    }, [isLoaded, isSignedIn, router])

    if (!isLoaded || !isSignedIn) return <div className="flex justify-center items-center h-screen">Carregando...</div>

    return <Dashboard />
}