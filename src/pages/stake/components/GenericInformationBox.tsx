import React, { ReactNode } from 'react'

import separateChildren from '../utils/separateChildren'
import SectionLabel from './SectionLabel'
import Twiv from './Twiv'

export default function GenericInformationBox({
  details,
}: {
  details: {
    title: string | ReactNode
    body: string | ReactNode
  }[]
}): JSX.Element {
  return (
    <Twiv css={`flex bg-[#fafafa] text-[#B471E1] rounded-xl items-stretch py-3 px-6 font-medium space-x-5 mb-8`}>
      {separateChildren(
        details.map((detail, i) => {
          const { title, body } = detail
          return (
            <Twiv key={i} css={details.length > 1 ? `flex space-x-3` : undefined}>
              <div>
                <SectionLabel>{title}</SectionLabel>
                <Twiv css={`mt-2 font-semibold`}>{body}</Twiv>
              </div>
            </Twiv>
          )
        })
      )}
    </Twiv>
  )
}
