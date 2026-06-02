'use client'

import { useRef, useEffect, useState } from 'react'
import { MotionValue } from 'framer-motion'

interface ScrollCanvasProps {
  scrollYProgress: MotionValue<number>
  totalFrames: number
  imageFolderPath: string
}

export default function ScrollCanvas({
  scrollYProgress,
  totalFrames,
  imageFolderPath,
}: ScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadedCount, setLoadedCount] = useState(0)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef<number>(-1)

  // 1. Preload images
  useEffect(() => {
    let isCancelled = false
    const preloadedImages: HTMLImageElement[] = []
    let loaded = 0

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image()
      img.src = `${imageFolderPath}/ezgif-frame-${String(i).padStart(3, '0')}.jpg`
      img.onload = () => {
        if (isCancelled) return
        loaded++
        setLoadedCount(loaded)
      }
      // If error occurs, still count it so we don't hang forever
      img.onerror = () => {
        if (isCancelled) return
        loaded++
        setLoadedCount(loaded)
      }
      preloadedImages.push(img)
    }

    imagesRef.current = preloadedImages

    return () => {
      isCancelled = true
    }
  }, [totalFrames, imageFolderPath])

  const allLoaded = loadedCount === totalFrames
  const progress = totalFrames > 0 ? loadedCount / totalFrames : 0

  // 2. Canvas drawing logic
  useEffect(() => {
    if (!allLoaded || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawFrame = (frameIndex: number) => {
      if (frameIndex === currentFrameRef.current) return
      
      const img = imagesRef.current[frameIndex]
      if (!img || !img.complete || img.naturalWidth === 0) return

      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // High-DPI fix
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Object-fit: contain logic
      const scale = Math.min(rect.width / img.width, rect.height / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (rect.width - w) / 2
      const y = (rect.height - h) / 2

      ctx.drawImage(img, x, y, w, h)
      currentFrameRef.current = frameIndex
    }

    // Initial draw
    const initialFrame = Math.round(scrollYProgress.get() * (totalFrames - 1))
    drawFrame(initialFrame)

    // Subscribe to scroll changes
    const unsubscribe = scrollYProgress.on('change', (value) => {
      const frameIndex = Math.round(value * (totalFrames - 1))
      drawFrame(frameIndex)
    })

    // Resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      // Force redraw
      currentFrameRef.current = -1
      const frameIndex = Math.round(scrollYProgress.get() * (totalFrames - 1))
      drawFrame(frameIndex)
    })
    resizeObserver.observe(canvas)

    return () => {
      unsubscribe()
      resizeObserver.disconnect()
    }
  }, [allLoaded, scrollYProgress, totalFrames])

  return (
    <>
      {!allLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-fragment-mono)',
              fontSize: '14px',
              letterSpacing: '0.2em',
              color: '#607C8E',
              marginBottom: '24px',
            }}
          >
            LOADING — {Math.round(progress * 100)}%
          </div>
          <div
            style={{
              width: '200px',
              height: '2px',
              backgroundColor: '#0D0D0E',
              borderRadius: '1px',
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: '#607C8E',
                borderRadius: '1px',
                transition: 'width 0.1s ease',
              }}
            />
          </div>
        </div>
      )}
      <div className="canvas-container">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </>
  )
}
