'use client'
import { useRowLabel } from '@payloadcms/ui'

type Props = {
  fieldName?: string
  prefix?: string
}

function extractText(node: any): string {
  if (!node || typeof node !== 'object') return ''
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  if (node.root) return extractText(node.root)
  return ''
}

const RowLabel: React.FC<Props> = ({ fieldName = 'heading', prefix }) => {
  const { data, rowNumber } = useRowLabel<Record<string, any>>()
  const raw = data?.[fieldName]
  const value = typeof raw === 'string' ? raw : extractText(raw)
  const label = value?.trim() || `Item ${(rowNumber ?? 0) + 1}`
  return <span>{prefix ? `${prefix}: ${label}` : label}</span>
}

export default RowLabel
