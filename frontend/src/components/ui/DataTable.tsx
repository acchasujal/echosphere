import React from 'react';

interface Column {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const DataTable: React.FC<{ columns: Column[]; data: any[] }> = ({ columns, data }) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-xs transition-all duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/40 transition-colors duration-150 group">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-3 text-xs text-foreground/90 font-medium
                      ${col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'}
                      ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
