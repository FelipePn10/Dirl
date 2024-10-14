import Dashboard from '@/components/Dashboard'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
    try {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.id) {
            console.log("User not authenticated, redirecting to auth-callback")
            redirect('/auth-callback?origin=dashboard')
        }

        const dbUser = await db.user.findFirst({
            where: {
                id: user.id,
            }
        })

        if (!dbUser) {
            console.log("User not found in database, creating new user")
            redirect('/auth-callback?origin=dashboard')
        }

        return <Dashboard />
    } catch (error) {
        console.error('Error in dashboard page:', error)
        redirect('/error')
    }
}

export default Page
