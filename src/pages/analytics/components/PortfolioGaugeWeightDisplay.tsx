import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Flex } from '../../../components/atoms/Layout'
import { Text } from '../../../components/atoms/Typography'
import { TileCard } from '../../../components/molecules/TileCard'
import { Button, GraySquareButton } from '../../../components/atoms/Button'
import { StyledClose } from '../../../components/atoms/Icon'
import { SmallerInputSection } from '../../../components/molecules/InputSection'
import { filterAmount, formatAmount, truncateValue } from '../../../utils/formatting'

export const PortfolioGaugeWeight: React.FC<{
  gaugeName: string
  weight: number
  editingItem: string | undefined
  handleEditingItem: (name?: string) => void
  saveEditedItem: (name: string, newWeight: string) => boolean
}> = ({ gaugeName, weight, editingItem, handleEditingItem, saveEditedItem }) => {
  const [enteredWeight, setEnteredWeight] = useState<string>('0')
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveEditedItem = useCallback(() => {
    const status = saveEditedItem(gaugeName, (parseFloat(formatAmount(enteredWeight)) / 100).toString())
    if (status) handleEditingItem(undefined)
  }, [enteredWeight, gaugeName, saveEditedItem, handleEditingItem])

  // input ref to focus
  const inputRef = useRef<HTMLInputElement>(null)
  // when gaugeName changes and is not undefined, focus input
  useEffect(() => {
    if (gaugeName) {
      inputRef.current?.focus()
    }
  }, [gaugeName])

  useEffect(() => {
    if (!editingItem || editingItem.toString() !== gaugeName.toString()) setIsEditing(false)
  }, [editingItem, gaugeName])

  useEffect(() => {
    setEnteredWeight((weight * 100).toString())
  }, [weight])

  return (
    <TileCard
      padding={16}
      onClick={
        isEditing
          ? undefined
          : () => {
              if (!isEditing) {
                setIsEditing(true)
                handleEditingItem(gaugeName)
              }
            }
      }
      style={{ position: 'relative', cursor: isEditing ? 'default' : 'move' }}
    >
      <Flex col gap={8}>
        <Flex stretch between gap={10}>
          {isEditing ? (
            <>
              <SmallerInputSection
                ref={inputRef}
                placeholder={'%'}
                value={enteredWeight}
                onChange={(e) => setEnteredWeight(filterAmount(e.target.value, enteredWeight))}
                style={{
                  maxHeight: '36px',
                }}
                asideBg
              />
              <GraySquareButton width={32} height={32} noborder onClick={() => handleEditingItem(undefined)} darkText>
                <StyledClose size={16} />
              </GraySquareButton>
            </>
          ) : (
            <div
              style={{
                width: '100%',
              }}
            >
              <Flex between gap={10}>
                <Flex itemsCenter gap={8}>
                  {/* protocol icon */}
                  <Flex>
                    <Text autoAlignVertical>
                      <img src={`https://assets.solace.fi/${gaugeName}`} width={16} height={16} />
                    </Text>
                  </Flex>
                  <Flex col gap={5}>
                    <Text autoAlignVertical t5s bold>
                      {gaugeName.toUpperCase()}
                    </Text>
                  </Flex>
                </Flex>
                <Flex itemsEnd>
                  <Text t3s bold>
                    {truncateValue(weight * 100, 2)}%
                  </Text>
                </Flex>
              </Flex>
            </div>
          )}
        </Flex>
      </Flex>
      {isEditing && (
        <Flex gap={8} mt={12}>
          <Button
            height={32}
            techygradient
            secondary
            noborder
            onClick={() => {
              handleSaveEditedItem()
            }}
            style={{ width: '100%', borderRadius: '8px' }}
          >
            <Flex gap={4} itemsCenter>
              <Text t5s bold>
                Set
              </Text>
            </Flex>
          </Button>
        </Flex>
      )}
    </TileCard>
  )
}
