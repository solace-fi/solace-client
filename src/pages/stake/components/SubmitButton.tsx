import React from 'react'
import styled from 'styled-components'
import tw, { TwStyle } from 'twin.macro'
const TheButton = styled.button<{
  twa: TwStyle
  children: React.ReactNode
}>`
  ${({ twa }: { twa: TwStyle }) => twa}
`

const buttonStyle = tw`mt-auto bg-[#5F5DF9] text-sm font-semibold text-white w-max px-5 py-1.5 rounded-xl mb-0.5 hover:bg-yellow-600 saturate-150 duration-200` as TwStyle &
  string
const SubmitButton = ({ text }: { text: string }): JSX.Element => <TheButton twa={buttonStyle}>{text}</TheButton>
//   <button
//     className="mt-auto bg-[#5F5DF9] text-sm font-semibold text-white w-max px-5 py-1.5 rounded-xl mb-0.5 hover:bg-yellow-600 saturate-150 duration-200"
//     type="submit"
//   >
//     {text}
//   </button>
// )
export default SubmitButton
