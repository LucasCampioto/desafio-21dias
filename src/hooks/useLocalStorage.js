import { useState, useEffect, useCallback } from 'react'
import { readStorage, writeStorage } from '../lib/utils'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  const reset = useCallback(() => {
    setValue(initialValue)
  }, [initialValue])

  return [value, setValue, reset]
}
