import React from 'react'

interface SevenSegmentDisplayProps {
  segments: boolean[]
}

const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({ segments }) => {
  const segmentClasses = [
    'absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full',
    'absolute top-1.5 right-0 w-1 h-2/5 rounded-full',
    'absolute bottom-1.5 right-0 w-1 h-2/5 rounded-full',
    'absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full',
    'absolute bottom-1.5 left-0 w-1 h-2/5 rounded-full',
    'absolute top-1.5 left-0 w-1 h-2/5 rounded-full',
    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 rounded-full',
    'absolute bottom-0 right-0 w-1 h-1 rounded-full'
  ]

  return (
    <div className="relative w-12 h-20 bg-gray-200 rounded-md">
      {segments.map((isOn, index) => (
        <div
          key={index}
          className={`${segmentClasses[index]} ${
            isOn ? 'bg-red-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export default SevenSegmentDisplay