import React, { useEffect, useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { Flex } from '../../../components/atoms/Layout'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { FunctionName } from '../../../constants/enums'
import { ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { isAddress } from '../../../utils'
import { useUwLockVoting } from '../../../hooks/lock/useUwLockVoting'
import { useTransactionExecution } from '../../../hooks/internal/useInputAmount'
import { Modal } from '../../../components/molecules/Modal'
import { Text } from '../../../components/atoms/Typography'
import { shortenAddress } from '../../../utils/formatting'
import { CopyButton } from '../../../components/molecules/CopyButton'
import { useVoteContext } from '../VoteContext'

export const DelegateModal = ({
  show,
  handleCloseModal,
}: {
  show: boolean
  handleCloseModal: () => void
}): JSX.Element => {
  const { setDelegate } = useUwLockVoting()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { delegateData } = useVoteContext()
  const { delegate: currentDelegate } = delegateData

  const [stagingDelegate, setStagingDelegate] = useState('')
  const [isValid, setIsValid] = useState(false)

  const inputOnChange = (value: string) => {
    setStagingDelegate(value)
  }

  const callSetDelegate = async (optionalAddr?: string) => {
    if (stagingDelegate === currentDelegate) return
    const delegate = optionalAddr ?? stagingDelegate
    await setDelegate(delegate)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callSetDelegate', err, FunctionName.SET_DELEGATE))
  }

  useEffect(() => {
    if (stagingDelegate.length == 0) {
      setIsValid(false)
      return
    }
    if (stagingDelegate == ZERO_ADDRESS) {
      setIsValid(false)
      return
    }
    if (!isAddress(stagingDelegate)) {
      setIsValid(false)
      return
    }
    setIsValid(true)
  }, [stagingDelegate])

  return (
    <Modal isOpen={show} handleClose={handleCloseModal} modalTitle={'Set Delegate'}>
      <Flex col gap={10}>
        <Flex col gap={5}>
          <Text t5s>Current Delegate</Text>
          <Flex gap={10} between stretch>
            {currentDelegate !== ZERO_ADDRESS ? (
              <>
                <Text t2 autoAlignVertical techygradient>
                  {shortenAddress(currentDelegate)}
                </Text>
                <CopyButton toCopy={currentDelegate} objectName={''} />
              </>
            ) : (
              <Text t2 autoAlignVertical>
                None
              </Text>
            )}
          </Flex>
        </Flex>
        <Flex col gap={10}>
          <SmallerInputSection
            placeholder={'New Address'}
            value={stagingDelegate}
            onChange={(e) => inputOnChange(e.target.value)}
          />
          <Flex col gap={2}>
            <Text t5s textAlignCenter>
              You can delegate your voting power to another user.
            </Text>
            <Text t5s textAlignCenter>
              They can vote on your behalf, but they cannot withdraw your tokens.
            </Text>
            <Text t5s warning textAlignCenter>
              Ensure that your delegate is someone you can trust.
            </Text>
          </Flex>

          <Flex gap={10}>
            <Button
              error
              disabled={currentDelegate == ZERO_ADDRESS}
              onClick={() => callSetDelegate(ZERO_ADDRESS)}
              widthP={100}
            >
              Remove
            </Button>
            <Button secondary info noborder disabled={!isValid} onClick={() => callSetDelegate()} widthP={100}>
              Save
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  )
}
