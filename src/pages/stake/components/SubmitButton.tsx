import React from 'react'
// import styled from 'styled-components'
// const TheButton = styled.button<{
//   twa: string
//   children: React.ReactNode
// }>`
//   ${({ twa }: { twa: string }) => twa}
// `

// button takes twa as a prop and adds it as className to the button
function TheButton({
  twa,
  children,
  ...props
}: {
  twa: string
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={twa} {...props}>
      {children}
    </button>
  )
}

const buttonStyle = `mt-auto bg-[#5F5DF9] text-sm font-semibold text-white w-max px-5 py-1.5 rounded-xl mb-0.5 hover:bg-yellow-600 saturate-150 duration-200`
const SubmitButton = ({ text }: { text: string }): JSX.Element => <TheButton twa={buttonStyle}>{text}</TheButton>
//   <button
//     className="mt-auto bg-[#5F5DF9] text-sm font-semibold text-white w-max px-5 py-1.5 rounded-xl mb-0.5 hover:bg-yellow-600 saturate-150 duration-200"
//     type="submit"
//   >
//     {text}
//   </button>
// )
export default SubmitButton
