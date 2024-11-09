'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import { ArrowRight } from "lucide-react"

const NavbarAuth = () => {
    const { user, isLoading } = useUser()

    if (isLoading) return null

    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <Link
                    href="/api/auth/logout"
                    className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm'
                    })}
                >
                    Logout
                </Link>
            ) : (
                <>
                    <Link
                        href="/api/auth/login"
                        className={buttonVariants({
                            variant: 'ghost',
                            size: 'sm'
                        })}
                    >
                        Login
                    </Link>
                    <Link
                        href="/api/auth/login"
                        className={buttonVariants({
                            size: 'sm'
                        })}
                    >
                        Começar <ArrowRight className="ml-1.5 h-5 w-5" />
                    </Link>
                </>
            )}
        </div>
    )
}

export default NavbarAuth