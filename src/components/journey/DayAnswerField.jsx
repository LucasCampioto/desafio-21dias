import { memo, useCallback, useEffect, useRef, useState } from 'react'
import Textarea from '../../design-system/Textarea'
import Input from '../../design-system/Input'

function DayAnswerField({
  fieldId,
  kind = 'textarea',
  value = '',
  onChange,
  readOnly,
  variant,
  label,
  placeholder,
}) {
  const [localValue, setLocalValue] = useState(value)
  const focusedRef = useRef(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!focusedRef.current) {
      setLocalValue(value)
    }
  }, [value, fieldId])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const pushToParent = useCallback(
    (nextValue) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onChange(fieldId, nextValue)
      }, 400)
    },
    [fieldId, onChange],
  )

  const handleChange = (event) => {
    const nextValue = event.target.value
    setLocalValue(nextValue)
    pushToParent(nextValue)
  }

  const handleFocus = () => {
    focusedRef.current = true
  }

  const handleBlur = (event) => {
    focusedRef.current = false
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    const nextValue = event.target.value
    setLocalValue(nextValue)
    onChange(fieldId, nextValue)
  }

  const shared = {
    variant,
    label,
    placeholder,
    value: localValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    disabled: readOnly,
  }

  if (kind === 'textarea') {
    return <Textarea {...shared} />
  }

  return <Input {...shared} />
}

export default memo(DayAnswerField)
