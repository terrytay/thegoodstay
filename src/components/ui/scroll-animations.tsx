'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollAnimationProps {
  children: ReactNode
  animation?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideInUp'
  delay?: number
  duration?: number
  threshold?: number
}

export default function ScrollAnimation({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state
    element.style.opacity = '0'
    element.style.transform = getInitialTransform(animation)
    element.style.transition = `all ${duration}s ease-out ${delay}s`

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate in
            entry.target.setAttribute('style', `
              opacity: 1;
              transform: translate(0, 0) scale(1);
              transition: all ${duration}s ease-out ${delay}s;
            `)
          }
        })
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [animation, delay, duration, threshold])

  const getInitialTransform = (animationType: string) => {
    switch (animationType) {
      case 'fadeInUp':
        return 'translateY(30px)'
      case 'fadeInLeft':
        return 'translateX(-30px)'
      case 'fadeInRight':
        return 'translateX(30px)'
      case 'scaleIn':
        return 'scale(0.9)'
      case 'slideInUp':
        return 'translateY(50px)'
      default:
        return 'translateY(30px)'
    }
  }

  return (
    <div ref={elementRef}>
      {children}
    </div>
  )
}