import React, { useCallback, useState } from 'react'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'
import { Text } from '../../../components/atoms/Typography'
import { Search } from '../../../components/atoms/Input'
import { TileCard } from '../../../components/molecules/TileCard'
import { BribeProviderModal } from './BribeProviderModal'
import { BribeChaserModal } from './BribeChaserModal'
import { useBribeContext } from '../BribeContext'
import { Loader } from '../../../components/atoms/Loader'
import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { BribeCardContainer } from './BribesListCardContainer'
import { BribeTable } from './BribesListTable'

export const BribeList = ({ isBribeChaser }: { isBribeChaser: boolean }): JSX.Element => {
  const { isMobile } = useWindowDimensions()
  const { intrface } = useBribeContext()
  const { bribeTokensLoading, gaugeBribeInfoLoading } = intrface
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedGaugeId, setSelectedGaugeId] = useState<BigNumber>(ZERO)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const handleOpenModal = useCallback((value: boolean) => {
    setOpenModal(value)
  }, [])

  const handleSelectBribe = useCallback(
    (id: BigNumber) => {
      setSelectedGaugeId(id)
      handleOpenModal(true)
    },
    [handleOpenModal]
  )

  return (
    <TileCard gap={16} bgSecondary>
      <BribeProviderModal
        isOpen={openModal && !isBribeChaser}
        selectedGaugeId={selectedGaugeId}
        handleClose={() => handleOpenModal(false)}
      />
      <BribeChaserModal
        isOpen={openModal && isBribeChaser}
        selectedGaugeId={selectedGaugeId}
        handleClose={() => handleOpenModal(false)}
      />
      <Text t3s bold>
        Bribe Market
      </Text>
      <Search placeholder={'Search Bribes'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      {!bribeTokensLoading &&
        !gaugeBribeInfoLoading &&
        (isMobile ? (
          <BribeCardContainer
            isBribeChaser={isBribeChaser}
            handleSelectBribe={handleSelectBribe}
            searchTerm={searchTerm}
          />
        ) : (
          <BribeTable isBribeChaser={isBribeChaser} handleSelectBribe={handleSelectBribe} searchTerm={searchTerm} />
        ))}
      {(bribeTokensLoading || gaugeBribeInfoLoading) && <Loader />}
    </TileCard>
  )
}
