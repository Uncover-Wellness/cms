'use client';

import React, { useMemo, useCallback } from 'react';
import { useField, FieldLabel } from '@payloadcms/ui';

/**
 * Custom Field component for the `rows` array on the dataTable block.
 *
 * Renders a real <table> editor: column definitions form the header, each row
 * is a <tr> with an <input> per cell. The editor never types column keys —
 * keys come from the sibling `columns` array. Storage shape is unchanged
 * (rows[].cells[].{key,value}), so existing data round-trips and the Astro
 * renderer (DataTableBlock.astro) needs no changes.
 */

type Column = {
  id?: string;
  key: string;
  label?: string;
  align?: 'left' | 'center' | 'right' | null;
  highlight?: boolean | null;
};

type Cell = { id?: string; key: string; value: string };
type Row = { id?: string; cells?: Cell[] | null };

type Props = {
  path: string;
};

function genId(): string {
  return `r${Math.random().toString(36).slice(2, 10)}`;
}

const DataTableEditor: React.FC<Props> = ({ path }) => {
  const { value: rawRows, setValue } = useField<Row[]>({ path });

  const parentPath = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : '';
  const { value: rawColumns } = useField<Column[]>({ path: `${parentPath}.columns` });

  const columns: Column[] = Array.isArray(rawColumns) ? rawColumns : [];
  const rows: Row[] = Array.isArray(rawRows) ? rawRows : [];

  // Build a positional grid: gridValues[rowIdx][colIdx] = cell value
  const gridValues: string[][] = useMemo(() => {
    return rows.map((row) => {
      const map = new Map<string, string>();
      (row.cells || []).forEach((c) => {
        if (c?.key != null) map.set(c.key, c.value ?? '');
      });
      return columns.map((col) => map.get(col.key) ?? '');
    });
  }, [rows, columns]);

  // Serialize the grid back into the storage shape, keyed by current columns.
  const writeRows = useCallback(
    (nextGrid: string[][], rowIds: (string | undefined)[]) => {
      const next: Row[] = nextGrid.map((rowVals, rIdx) => ({
        id: rowIds[rIdx] ?? genId(),
        cells: columns.map((col, cIdx) => ({
          id: rows[rIdx]?.cells?.find((c) => c?.key === col.key)?.id ?? genId(),
          key: col.key,
          value: rowVals[cIdx] ?? '',
        })),
      }));
      setValue(next);
    },
    [columns, rows, setValue],
  );

  const setCell = (rIdx: number, cIdx: number, value: string) => {
    const nextGrid = gridValues.map((r) => [...r]);
    nextGrid[rIdx][cIdx] = value;
    const ids = rows.map((r) => r.id);
    writeRows(nextGrid, ids);
  };

  const addRow = () => {
    const nextGrid = [...gridValues, columns.map(() => '')];
    const ids = [...rows.map((r) => r.id), genId()];
    writeRows(nextGrid, ids);
  };

  const deleteRow = (rIdx: number) => {
    const nextGrid = gridValues.filter((_, i) => i !== rIdx);
    const ids = rows.map((r) => r.id).filter((_, i) => i !== rIdx);
    writeRows(nextGrid, ids);
  };

  const moveRow = (rIdx: number, dir: -1 | 1) => {
    const target = rIdx + dir;
    if (target < 0 || target >= gridValues.length) return;
    const nextGrid = gridValues.map((r) => [...r]);
    [nextGrid[rIdx], nextGrid[target]] = [nextGrid[target], nextGrid[rIdx]];
    const ids = rows.map((r) => r.id);
    [ids[rIdx], ids[target]] = [ids[target], ids[rIdx]];
    writeRows(nextGrid, ids);
  };

  if (columns.length === 0) {
    return (
      <div style={styles.wrap}>
        <FieldLabel label="Rows" />
        <div style={styles.empty}>
          Add at least one column above before editing rows.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <FieldLabel label="Rows" />
      <p style={styles.hint}>
        Type directly into the cells. Columns are defined above; values are saved against the column's key.
      </p>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.controlCol }} aria-label="Row controls" />
              {columns.map((col, i) => (
                <th key={col.id ?? i} style={styles.th}>
                  {col.label || col.key || `Column ${i + 1}`}
                  {col.key ? (
                    <span style={styles.colKey}>{col.key}</span>
                  ) : (
                    <span style={styles.colKeyMissing}>missing key</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridValues.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={styles.emptyRow}>
                  No rows yet — click "Add row" to get started.
                </td>
              </tr>
            ) : (
              gridValues.map((rowVals, rIdx) => (
                <tr key={rows[rIdx]?.id ?? rIdx}>
                  <td style={{ ...styles.td, ...styles.controlCol }}>
                    <div style={styles.controls}>
                      <span style={styles.rowNum}>{rIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => moveRow(rIdx, -1)}
                        disabled={rIdx === 0}
                        style={styles.iconBtn}
                        aria-label="Move row up"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(rIdx, 1)}
                        disabled={rIdx === gridValues.length - 1}
                        style={styles.iconBtn}
                        aria-label="Move row down"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRow(rIdx)}
                        style={{ ...styles.iconBtn, ...styles.deleteBtn }}
                        aria-label="Delete row"
                        title="Delete row"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                  {rowVals.map((val, cIdx) => (
                    <td key={cIdx} style={styles.td}>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setCell(rIdx, cIdx, e.target.value)}
                        style={styles.input}
                        placeholder={columns[cIdx]?.label || ''}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} style={styles.addBtn}>
        + Add row
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    margin: '1rem 0',
  },
  hint: {
    fontSize: '0.8rem',
    color: 'var(--theme-elevation-500, #6d6d6d)',
    margin: '0.25rem 0 0.75rem',
  },
  empty: {
    padding: '1rem',
    background: 'var(--theme-elevation-50, #f5f5f5)',
    border: '1px dashed var(--theme-elevation-200, #ddd)',
    borderRadius: '0.25rem',
    color: 'var(--theme-elevation-500, #6d6d6d)',
    fontSize: '0.85rem',
  },
  tableWrap: {
    overflowX: 'auto',
    border: '1px solid var(--theme-elevation-150, #e0e0e0)',
    borderRadius: '0.25rem',
    background: 'var(--theme-input-bg, #fff)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    background: 'var(--theme-elevation-50, #f5f5f5)',
    padding: '0.5rem 0.6rem',
    textAlign: 'left',
    fontWeight: 600,
    borderBottom: '1px solid var(--theme-elevation-150, #e0e0e0)',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.25rem',
    borderBottom: '1px solid var(--theme-elevation-100, #eee)',
    verticalAlign: 'top',
  },
  controlCol: {
    width: '8rem',
    background: 'var(--theme-elevation-50, #fafafa)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem',
  },
  rowNum: {
    fontSize: '0.75rem',
    color: 'var(--theme-elevation-500, #6d6d6d)',
    minWidth: '1.25rem',
    textAlign: 'center',
  },
  iconBtn: {
    border: '1px solid var(--theme-elevation-200, #ddd)',
    background: 'var(--theme-input-bg, #fff)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '0.25rem',
    padding: 0,
    color: 'var(--theme-text, #333)',
  },
  deleteBtn: {
    color: '#c0392b',
  },
  input: {
    width: '100%',
    padding: '0.4rem 0.5rem',
    border: '1px solid transparent',
    background: 'transparent',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    color: 'var(--theme-text, #333)',
    outline: 'none',
    borderRadius: '0.25rem',
  },
  emptyRow: {
    padding: '1rem',
    textAlign: 'center',
    color: 'var(--theme-elevation-500, #6d6d6d)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  addBtn: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'var(--theme-elevation-100, #f0f0f0)',
    border: '1px solid var(--theme-elevation-200, #ddd)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--theme-text, #333)',
  },
  colKey: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 400,
    color: 'var(--theme-elevation-500, #6d6d6d)',
    marginTop: '0.1rem',
    fontFamily: 'monospace',
  },
  colKeyMissing: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 400,
    color: '#c0392b',
    marginTop: '0.1rem',
    fontStyle: 'italic',
  },
};

export default DataTableEditor;
