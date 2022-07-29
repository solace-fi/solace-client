import React from 'react'
import { StyledCheckmark, StyledWarning } from '../../components/atoms/Icon'
import { Flex } from '../../components/atoms/Layout'
import { Text } from '../../components/atoms/Typography'
import { LoaderText } from '../../components/molecules/LoaderText'
import { Modal } from '../../components/molecules/Modal'
import { ApiStatus } from '../../constants/enums'
import { useCoverageContext } from './CoverageContext'

export const CodeNoticeModal = () => {
  const { intrface, referral } = useCoverageContext()
  const { showCodeNoticeModal, handleShowCodeNoticeModal } = intrface
  const { codeApplicationStatus } = referral

  return (
    <Modal
      isOpen={showCodeNoticeModal}
      modalTitle={''}
      handleClose={() => handleShowCodeNoticeModal(false)}
      disableCloseButton={codeApplicationStatus == ApiStatus.PENDING || codeApplicationStatus == 'handling referral'}
    >
      <Flex col gap={15} w={300} marginAuto>
        {(codeApplicationStatus == ApiStatus.PENDING || codeApplicationStatus == 'handling referral') && (
          <>
            <Text textAlignCenter bold t2>
              Please do not exit this screen
            </Text>
            <LoaderText
              loaderWidth={100}
              loaderHeight={100}
              width={100}
              info={codeApplicationStatus == 'handling referral'}
              text={codeApplicationStatus == ApiStatus.PENDING ? 'Activating Policy' : 'Applying Code'}
            />
            <Text textAlignCenter t3>
              Your referral code is being applied alongside the activation of your policy.
            </Text>
            <Text textAlignCenter t3>
              Exiting this screen before receiving confirmation may not grant you referral credit.
            </Text>
          </>
        )}
        {codeApplicationStatus == ApiStatus.OK && (
          <>
            <Text textAlignCenter bold t2>
              Confirmation Status
            </Text>
            <Text success>
              <StyledCheckmark size={80} />
            </Text>
            <Text textAlignCenter t3>
              Your referral code has been successfully applied alongside the activation of your policy.
            </Text>
            <Text textAlignCenter t3>
              Your rewards will be credited to your account shortly.
            </Text>
            <Text textAlignCenter t3>
              You may now exit this screen.
            </Text>
          </>
        )}
        {codeApplicationStatus == ApiStatus.ERROR && (
          <>
            <Text textAlignCenter bold t2>
              Confirmation Status
            </Text>
            <Text error>
              <StyledWarning size={80} />
            </Text>
            <Text textAlignCenter t3>
              Your referral code could not be applied alongside the activation of your policy.
            </Text>
            <Text textAlignCenter t3>
              Please contact the team if you have any questions or issues.
            </Text>
            <Text textAlignCenter t3>
              You may now exit this screen.
            </Text>
          </>
        )}
        {codeApplicationStatus == 'activation failed' && (
          <>
            <Text textAlignCenter bold t2>
              Confirmation Status
            </Text>
            <Text error>
              <StyledWarning size={80} />
            </Text>
            <Text textAlignCenter t3>
              Your policy has failed to activate before the referral code can be applied. Please try again later.
            </Text>
            <Text textAlignCenter t3>
              Please contact the team if you have any questions or issues.
            </Text>
            <Text textAlignCenter t3>
              You may now exit this screen.
            </Text>
          </>
        )}
      </Flex>
    </Modal>
  )
}
