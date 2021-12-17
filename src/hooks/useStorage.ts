/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useCallback } from 'react'

// overload 2 types for innerStorageFunction. If defaultValue is null or undefined, it returns a tuple of [valuetype, updater, cleaner]. Otherwise, it returns a tuple of [valuetype | null, updater with valuetype | null, cleaner]
export function useStorage<ValueType>(
  storageType: 'local' | 'session',
  key: string,
  defaultValue: undefined | null
): [ValueType | null, (updatedValue: ValueType | null, remove?: boolean) => void, () => void]

export function useStorage<ValueType>(
  storageType: 'local' | 'session',
  key: string,
  defaultValue: ValueType
): [ValueType, (updatedValue: ValueType, remove?: boolean) => void, () => void]

export default function useStorage<ValueType>(
  storageType: 'local' | 'session',
  key: string,
  defaultValue: ValueType | null = null
):
  | [ValueType | null, (updatedValue: ValueType | null, remove?: boolean) => void, () => void]
  | [ValueType, (updatedValue: ValueType, remove?: boolean) => void, () => void] {
  // define storage and event so that we can add them later when window is defined (throw error if not defined when used)
  const [storage, setStorage] = useState<Storage | null>(null)
  const [eventTarget, setEventTarget] = useState<EventTarget | null>(null)
  // define the default value state, then update it once window is defined and we can get defaults from browser storage
  const [value, setValue] = useState<ValueType | null>(null)
  useEffect(() => {
    // useEffect ensures window is defined before we try to get storage and EventTarget
    const storage = storageType === 'local' ? localStorage : sessionStorage
    setStorage(storage)
    const evtTarget = new EventTarget()
    setEventTarget(evtTarget)
    // if we have a default value, state value is storage.getItem value or default value
    // if we don't have a default value, state value is storage.getItem value or null
    const raw = storage.getItem(key)
    const value = raw ? (JSON.parse(raw) as ValueType | null) : defaultValue
    // set the state value to the value we just got from storage
    setValue(value)
    // check if the value we got from storage is different than the default value
    if (defaultValue != null && JSON.stringify(defaultValue) !== raw) {
      // if so, update the storage with the default value
      storage.setItem(key, JSON.stringify(defaultValue))
    }
  }, [key, defaultValue, storageType])
  // define the updater function that will be used to update the value in storage and state
  const updater = useCallback(
    (updatedValue: ValueType | null, remove = false) => {
      // if no window & dependencies yet, throw error
      if (!storage) {
        throw new Error('No storage available')
      }
      // in theory, the second conditional should never fail if the first one succeeds, but just in case
      if (!eventTarget) {
        throw new Error('No event target available')
      }
      setValue(updatedValue)
      // if remove is true, which only happens when calling the third returned item in the useStorage array, remove the key&value pair from storage
      storage[remove ? 'removeItem' : 'setItem'](key, JSON.stringify(updatedValue))
      eventTarget.dispatchEvent(new CustomEvent('storage_change', { detail: { key } }))
    },
    [storage, eventTarget, key]
  )
  useEffect(() => {
    // if no storage, wait till storage is available
    if (!storage) {
      return
    }
    // if no event target, wait till event target is available
    if (!eventTarget) {
      return
    }

    const listener = ({ detail }: any) => {
      if (detail.key === key) {
        const raw = storage.getItem(key)
        raw !== JSON.stringify(value) && setValue(JSON.parse(raw as string))
      } else {
        console.warn('storage_change event received for unknown key', detail)
      }
    }
    eventTarget.addEventListener('storage_change', listener)
    return () => eventTarget.removeEventListener('storage_change', listener)
  }, [storage, eventTarget, key, value])
  // return the value, updater and cleaner
  if (defaultValue === null || defaultValue === undefined) {
    return [value, updater, () => updater(null, true)] as [
      ValueType | null,
      (updatedValue: ValueType | null, remove?: boolean) => void,
      () => void
    ]
  } else {
    return [value, updater, () => updater(defaultValue, true)] as [
      ValueType,
      (updatedValue: ValueType, remove?: boolean) => void,
      () => void
    ]
  }
}

// const useStorage = (type: 'local' | 'session') => InnerStorageFunction

// export default useStorage
// function useStorage(
//   type: 'local' | 'session',
// ): (key: string, defaultValue: any | null) => [any | null, (updatedValue: any | null, remove?: boolean) => void, () => void]

// export const useLocalStorage = useStorage('local')
// export const useSessionStorage = useStorage('session')
