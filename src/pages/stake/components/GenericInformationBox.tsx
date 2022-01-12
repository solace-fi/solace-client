import React, { ReactNode } from 'react'
import tw from 'twin.macro'
import classOrEmpty from '../functions/classOrEmpty'
import separateChildren from '../functions/separateChildren'
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
    <Twiv css={tw`flex bg-bg-secondary text-text-purple rounded-xl items-stretch py-3 px-6 font-medium space-x-5 mb-8`}>
      {separateChildren(
        details.map((detail, i) => {
          const { title, body } = detail
          return (
            <div key={i} className={classOrEmpty(details.length > 1, 'flex space-x-3')}>
              <div>
                <SectionLabel>{title}</SectionLabel>
                <Twiv css={tw`mt-2 font-semibold`}>{body}</Twiv>
              </div>
            </div>
          )
        })
      )}
    </Twiv>
  )
}
