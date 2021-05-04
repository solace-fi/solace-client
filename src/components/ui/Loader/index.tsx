import React from 'react'

export const Loader = (): any => {
  return (
    <svg style={{ width: '100px', height: '90px' }}>
      <path
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
        strokeDasharray="225.7982568359375 30.790671386718742"
        d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          repeatCount="indefinite"
          dur="1.2048192771084336s"
          keyTimes="0;1"
          values="0;256.58892822265625"
        ></animate>
      </path>
    </svg>
  )
}
