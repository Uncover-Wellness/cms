'use client';

import React, { useCallback, useMemo } from 'react';
import { useAllFormFields, useForm, FieldLabel } from '@payloadcms/ui';

/**
 * Custom Field component for the `rows` array on the dataTable block.
 *
 * Renders a real <table> editor: the sibling `columns` array forms the header,
 * each row is a <tr> with an <input> per cell. Editor types into cells; column
 * keys are derived from sibling state and written back into the `{key,value}`
 * cell shape behind the scenes — schema is unchanged so existing data
 * round-trips and the Astro renderer (DataTableBlock.astro) is unaffected.
 *
 * Reads/writes go through the Payload form context (useForm) — direct
 * setValue on an array path doesn't work in Payload v3 because the form
 * state is flat. Reads use getDataByPath (subscribed to via useAllFormFields).
 * Writes use dispatchFields(UPDATE) for cells and addFieldRow / removeFieldRow
 * / moveFieldRow for row mutations.
 */

type Column = {
  id?: string;
  key: string;
  label?: string;
  align?: 'left' | 'center' | 'right' | null;
  highlight?: boolean | null;
};

type Cell = { id?: string; key?: string; value?: string };
type Row = { id?: string; cells?: Cell[] | null };

type Props = {
  path: string;
  schemaPath?: string;
};

const DataTableEditor: React.FC<Props> = ({ path, schemaPath }) => {
  const { addFieldRow, removeFieldRow, moveFieldRow, dispatchFields, getDataByPath } = useForm();
  // Subscribe to form state changes — without this, our memoised reads from
  // getDataByPath would never update.
  const [allFields] = useAllFormFields();

  const parentPath = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : '';
  const columnsPath = `${parentPath}.columns`;
  const effectiveSchemaPath = schemaPath ?? path;
  const cellsSchemaPath = `${effectiveSchemaPath}.cells`;

  const columns: Column[] = useMemo(() => {
    const data = getDataByPath<Column[]>(columnsPath);
    return Array.isArray(data) ? data : [];
    // allFields included so we re-read after any form-state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDataByPath, columnsPath, allFields]);

  const rows: Row[] = useMemo(() => {
    const data = getDataByPath<Row[]>(path);
    return Array.isArray(data) ? data : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDataByPath, path, allFields]);

  const valueAt = useCallback((row: Row | undefined, key: string): string => {
    if (!row?.cells) return '';
    const found = row.cells.find((c) => c?.key === key);
    return found?.value ?? '';
  }, []);

  const cellIndexFor = (row: Row | undefined, key: string): number =>
    (row?.cells || []).findIndex((c) => c?.key === key);

  const setCell = useCallback(
    (rIdx: number, col: Column, value: string) => {
      const row = rows[rIdx];
      const cIdx = cellIndexFor(row, col.key);
      if (cIdx >= 0) {
        // Cell exists — update its value
        dispatchFields({
          type: 'UPDATE',
          path: `${path}.${rIdx}.cells.${cIdx}.value`,
          value,
          initialValue: value,
          valid: true,
        });
      } else {
        // Cell doesn't exist yet — append a new one with this key
        const nextIdx = (row?.cells || []).length;
        addFieldRow({
          path: `${path}.${rIdx}.cells`,
          rowIndex: nextIdx,
          schemaPath: cellsSchemaPath,
        });
        dispatchFields({
          type: 'UPDATE',
          path: `${path}.${rIdx}.cells.${nextIdx}.key`,
          value: col.key,
          initialValue: col.key,
          valid: true,
        });
        dispatchFields({
          type: 'UPDATE',
          path: `${path}.${rIdx}.cells.${nextIdx}.value`,
          value,
          initialValue: value,
          valid: true,
        });
      }
    },
    [rows, path, cellsSchemaPath, addFieldRow, dispatchFields],
  );

  const addRow = useCallback(() => {
    const newRowIdx = rows.length;
    addFieldRow({ path, rowIndex: newRowIdx, schemaPath: effectiveSchemaPath });
    // Pre-create one cell per column so the editor can type immediately.
    columns.forEach((col, cIdx) => {
      addFieldRow({
        path: `${path}.${newRowIdx}.cells`,
        rowIndex: cIdx,
        schemaPath: cellsSchemaPath,
      });
      dispatchFields({
        type: 'UPDATE',
        path: `${path}.${newRowIdx}.cells.${cIdx}.key`,
        value: col.key,
        initialValue: col.key,
        valid: true,
      });
    });
  }, [rows.length, columns, path, effectiveSchemaPath, cellsSchemaPath, addFieldRow, dispatchFields]);

  const deleteRow = useCallback(
    (rIdx: number) => {
      removeFieldRow({ path, rowIndex: rIdx });
    },
    [removeFieldRow, path],
  );

  const moveRow = useCallback(
    (rIdx: number, dir: -1 | 1) => {
      const target = rIdx + dir;
      if (target < 0 || target >= rows.length) return;
      moveFieldRow({ path, moveFromIndex: rIdx, moveToIndex: target });
    },
    [moveFieldRow, path, rows.length],
  );

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={styles.emptyRow}>
                  No rows yet — click "Add row" to get started.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={row?.id ?? rIdx}>
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
                        disabled={rIdx === rows.length - 1}
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
                  {columns.map((col, cIdx) => (
                    <td key={col.id ?? cIdx} style={styles.td}>
                      <input
                        type="text"
                        value={valueAt(row, col.key)}
                        onChange={(e) => setCell(rIdx, col, e.target.value)}
                        style={styles.input}
                        placeholder={col.label || ''}
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
