import { useState, useEffect } from "react"

/**
 * Hook to detect if the current viewport is mobile-sized based on width and/or height
 * @param width - Width in pixels or string below which is considered mobile. Default: 640
 * @param height - Height in pixels or string below which is considered mobile. Default: 0
 * @returns boolean indicating if the screen is mobile-sized
 */
export function useIsMobile(width: number | string = 640, height: number | string = 0): boolean {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkSize = () => {
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight
            const targetWidth = typeof width === "number" ? width : parseInt(String(width)) || 0
            const targetHeight = typeof height === "number" ? height : parseInt(String(height)) || 0

            setIsMobile(windowWidth < targetWidth || (targetHeight > 0 && windowHeight < targetHeight))
        }

        // Check on mount
        checkSize()

        // Listen for resize events
        window.addEventListener("resize", checkSize)
        return () => window.removeEventListener("resize", checkSize)
    }, [width, height])

    return isMobile
}
