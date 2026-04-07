'use client'
import { useRowLabel } from '@payloadcms/ui'

type Props = {
  fieldName?: string
  prefix?: string
}

const RowLabel: React.FC<Props> = ({ fieldName = 'heading', prefix }) => {
  const { data, rowNumber } = useRowLabel<Record<string, any>>()
  const value = data?.[fieldName]
  const label = value || `Item ${(rowNumber ?? 0) + 1}`
  return <span>{prefix ? `${prefix}: ${label}` : label}</span>
}

export default RowLabel
