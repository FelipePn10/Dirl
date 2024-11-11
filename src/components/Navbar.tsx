'use client'

import Link from "next/link"
import { useUser, UserButton, SignInButton } from '@clerk/nextjs'
import MaxWidthWrapper from "./MaxWidthWrapper"
import { buttonVariants } from "./ui/button"
import { ArrowRight } from "lucide-react"

const Navbar = () => {
    const { isSignedIn, isLoaded } = useUser()

    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWidthWrapper>
                <div className="flex h-14 items-center justify-between border-b border-zinc-200">
                    <Link
                        href='/'
                        className="flex z-40 font-semibold"
                    >
                        <span>luapdf.</span>
                    </Link>

                    {/* todo: add mobile navbar */}

                    <div className="hidden items-center space-x-4 sm:flex">
                        <>
                            <Link href='/pricing' className={buttonVariants({
                                variant: 'ghost',
                                size: 'sm'
                            })}>Preços</Link>
                            {isLoaded && (
                                isSignedIn ? (
                                    <UserButton afterSignOutUrl="/" />
                                ) : (
                                    <>
                                        <SignInButton mode="modal">
                                            <button className={buttonVariants({
                                                variant: 'ghost',
                                                size: 'sm'
                                            })}>
                                                Login
                                            </button>
                                        </SignInButton>
                                        <SignInButton mode="modal">
                                            <button className={buttonVariants({
                                                size: 'sm'
                                            })}>
                                                Começar <ArrowRight className="ml-1.5 h-5 w-5" />
                                            </button>
                                        </SignInButton>
                                    </>
                                )
                            )}
                        </>
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    )
}

export default Navbar