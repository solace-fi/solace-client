import React from 'react'
import { Flex } from '../../../../components/atoms/Layout'
import { WhiteCircle } from '../../../../components/atoms/Icon/WhiteCircle'
import { Text } from '../../../../components/atoms/Typography'

export function AboutThesis({ title, text }: { title: string; text: string | React.ReactNode }): JSX.Element {
  return (
    <Flex mt={10}>
      <Flex
        style={{
          minWidth: '30px',
          marginTop: '5px',
        }}
      >
        {/* <img src={whiteCircle} alt="small circle" /> */}
        <WhiteCircle />
      </Flex>
      <Flex col gap={10}>
        <Text
          style={{
            lineHeight: '24px',
          }}
          mont
          extrabold
          light
          t1s
          mt={4}
        >
          {title}
        </Text>
        <Text
          light
          regular
          style={{
            lineHeight: '24px',
          }}
          mt={10}
          t3s
        >
          {text}
        </Text>
      </Flex>
    </Flex>
  )
}
