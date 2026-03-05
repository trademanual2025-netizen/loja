'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)
    const [width, setWidth] = useState(0)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const interval = useRef<ReturnType<typeof setInterval> | null>(null)
    const prevPath = useRef(pathname)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a')
            if (!target) return
            const href = target.getAttribute('href')
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return
            if (href === pathname) return
            startProgress()
        }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [pathname])

    useEffect(() => {
        if (pathname !== prevPath.current) {
            prevPath.current = pathname
            completeProgress()
        }
    }, [pathname])

    function startProgress() {
        if (timer.current) clearTimeout(timer.current)
        if (interval.current) clearInterval(interval.current)
        setWidth(10)
        setVisible(true)
        let w = 10
        interval.current = setInterval(() => {
            w = Math.min(w + Math.random() * 8, 85)
            setWidth(w)
        }, 300)
    }

    function completeProgress() {
        if (interval.current) clearInterval(interval.current)
        setWidth(100)
        timer.current = setTimeout(() => {
            setVisible(false)
            setWidth(0)
        }, 300)
    }

    if (!visible) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${width}%`,
            height: 2,
            background: 'linear-gradient(90deg, rgba(200,160,80,0.8), rgba(230,190,100,1))',
            zIndex: 9999,
            transition: width === 100 ? 'width 0.2s ease' : 'width 0.3s ease',
            boxShadow: '0 0 8px rgba(200,160,80,0.6)',
            borderRadius: '0 2px 2px 0',
        }} />
    )
}
