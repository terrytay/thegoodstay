'use client'

import { useEffect, useState } from 'react'
import { Heart, Sparkles, Star } from 'lucide-react'

interface FloatingElement {
  id: string
  type: 'heart' | 'sparkle' | 'star'
  x: number
  y: number
  delay: number
  duration: number
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    // Create floating elements
    const newElements: FloatingElement[] = []
    const types: FloatingElement['type'][] = ['heart', 'sparkle', 'star']
    
    for (let i = 0; i < 12; i++) {
      newElements.push({
        id: `element-${i}`,
        type: types[i % types.length],
        x: Math.random() * 100, // 0-100%
        y: Math.random() * 100, // 0-100%
        delay: Math.random() * 10, // 0-10 seconds
        duration: 8 + Math.random() * 8 // 8-16 seconds
      })
    }
    
    setElements(newElements)
  }, [])

  const getIcon = (type: FloatingElement['type']) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-4 h-4 text-pink-400 fill-current" />
      case 'sparkle':
        return <Sparkles className="w-4 h-4 text-yellow-400 fill-current" />
      case 'star':
        return <Star className="w-4 h-4 text-blue-400 fill-current" />
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float-gentle opacity-20"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`
          }}
        >
          {getIcon(element.type)}
        </div>
      ))}
      
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-30px) rotate(8deg);
            opacity: 0.4;
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle linear infinite;
        }
      `}</style>
    </div>
  )
}