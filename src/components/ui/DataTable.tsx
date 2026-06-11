import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  Pin,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from './utils';
import { Card } from './Card';
import { Tooltip } from './Tooltip';
import { Select, SelectTrigger, SelectContent, SelectItem } from './Select';

export type SortDirection = 'asc' | 'desc';
export type StickyPin = 'left' | 'right' | false;

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | null;
  defaultVisible?: boolean;
  defaultPin?: StickyPin;
  className?: string;
  minWidth?: number;
}

export interface DataTableProps<T> {
  tableId: string;
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  animate?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  emptyState?: (colSpan: number) => React.ReactNode;
  toolbarLeft?: React.ReactNode;
  className?: string;
}

interface ColumnConfig {
  visible: boolean;
  pin: StickyPin;
}

type ColumnsConfig = Record<string, ColumnConfig>;

const useColumnConfig = (tableId: string, columns: ColumnDef<any>[]) => {
  const [config, setConfig] = React.useState<ColumnsConfig>(() => {
    const key = `datatable_config_${tableId}`;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      return typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });

  const mergedConfig = React.useMemo<ColumnsConfig>(() => {
    const merged: ColumnsConfig = {};
    for (const col of columns) {
      merged[col.key] = {
        visible: config[col.key]?.visible ?? (col.defaultVisible !== false),
        pin: config[col.key]?.pin ?? (col.defaultPin ?? false),
      };
    }
    return merged;
  }, [columns, config]);

  const updateConfig = React.useCallback((newConfig: ColumnsConfig) => {
    setConfig(newConfig);
    const key = `datatable_config_${tableId}`;
    localStorage.setItem(key, JSON.stringify(newConfig));
  }, [tableId]);

  return { config: mergedConfig, updateConfig };
};

const computeStickyStyles = (
  visibleColumns: ColumnDef<any>[],
  columnsConfig: ColumnsConfig,
  isHeader: boolean
): Map<string, React.CSSProperties> => {
  const styles = new Map<string, React.CSSProperties>();
  const DEFAULT_WIDTH = 120;

  const leftPinned = visibleColumns.filter(c => columnsConfig[c.key]?.pin === 'left');
  const rightPinned = visibleColumns.filter(c => columnsConfig[c.key]?.pin === 'right');

  let leftOffset = 0;
  for (const col of leftPinned) {
    const style: React.CSSProperties = {
      position: 'sticky',
      left: leftOffset,
      zIndex: isHeader ? 3 : 2,
      backgroundColor: isHeader ? 'rgb(249 250 251 / 0.95)' : 'rgb(255 255 255)',
    };
    if (document.documentElement.classList.contains('dark')) {
      style.backgroundColor = isHeader ? 'rgb(15 23 42 / 0.95)' : 'rgb(15 23 42)';
    }
    styles.set(col.key, style);
    leftOffset += col.minWidth ?? DEFAULT_WIDTH;
  }

  let rightOffset = 0;
  for (const col of [...rightPinned].reverse()) {
    const style: React.CSSProperties = {
      position: 'sticky',
      right: rightOffset,
      zIndex: isHeader ? 3 : 2,
      backgroundColor: isHeader ? 'rgb(249 250 251 / 0.95)' : 'rgb(255 255 255)',
    };
    if (document.documentElement.classList.contains('dark')) {
      style.backgroundColor = isHeader ? 'rgb(15 23 42 / 0.95)' : 'rgb(15 23 42)';
    }
    styles.set(col.key, style);
    rightOffset += col.minWidth ?? DEFAULT_WIDTH;
  }

  return styles;
};

interface ColumnConfigPanelProps {
  columns: ColumnDef<any>[];
  columnsConfig: ColumnsConfig;
  onConfigChange: (config: ColumnsConfig) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ColumnConfigPanel: React.FC<ColumnConfigPanelProps> = ({
  columns,
  columnsConfig,
  onConfigChange,
  open,
  onOpenChange,
}) => {
  const handleToggleVisible = (key: string) => {
    const newConfig = {
      ...columnsConfig,
      [key]: {
        ...columnsConfig[key],
        visible: !columnsConfig[key]?.visible,
      },
    };
    onConfigChange(newConfig);
  };

  const handleTogglePin = (key: string, pin: StickyPin) => {
    const newConfig = {
      ...columnsConfig,
      [key]: {
        ...columnsConfig[key],
        pin: columnsConfig[key]?.pin === pin ? false : pin,
      },
    };
    onConfigChange(newConfig);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Tooltip content="Configure columns" side="top">
        <Popover.Trigger asChild>
          <button type="button" className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
            <Settings2 size={14} />
            <span className="hidden sm:inline">Columns</span>
          </button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content className="z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-3 w-80">
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {columns.map((col) => (
            <div key={col.key} className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md">
              <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={columnsConfig[col.key]?.visible ?? true}
                  onChange={() => handleToggleVisible(col.key)}
                  className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{col.header}</span>
              </label>
              <div className="flex gap-1">
                <Tooltip content={columnsConfig[col.key]?.pin === 'left' ? 'Unpin' : 'Pin left'} side="top">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(col.key, 'left')}
                    className={cn(
                      'p-1 rounded text-xs transition-colors',
                      columnsConfig[col.key]?.pin === 'left'
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    )}
                    aria-label="Pin column to left"
                  >
                    <Pin size={14} />
                  </button>
                </Tooltip>

                <Tooltip content={columnsConfig[col.key]?.pin === 'right' ? 'Unpin' : 'Pin right'} side="top">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(col.key, 'right')}
                    className={cn(
                      'p-1 rounded text-xs transition-colors',
                      columnsConfig[col.key]?.pin === 'right'
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    )}
                    aria-label="Pin column to right"
                  >
                    <Pin size={14} className="rotate-90" />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageSize,
  totalRows,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalRows / pageSize);
  const startRow = totalRows === 0 ? 0 : page * pageSize + 1;
  const endRow = Math.min((page + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        {totalRows === 0 ? 'No rows' : `Showing ${startRow}–${endRow} of ${totalRows}`}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="w-16 h-8 text-xs">
              {pageSize}
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="First page" side="top">
            <button
              type="button"
              onClick={() => onPageChange(0)}
              disabled={page === 0}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="Go to first page"
            >
              <ChevronsLeft size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Previous page" side="top">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="Go to previous page"
            >
              <ChevronLeft size={14} />
            </button>
          </Tooltip>

          <span className="text-xs text-slate-500 dark:text-slate-400 px-2 font-medium">
            {totalPages === 0 ? '0' : `${page + 1}/${totalPages}`}
          </span>

          <Tooltip content="Next page" side="top">
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="Go to next page"
            >
              <ChevronRight size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Last page" side="top">
            <button
              type="button"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:hover:bg-slate-800"
              aria-label="Go to last page"
            >
              <ChevronsRight size={14} />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

interface SortIndicatorProps {
  isSortable: boolean;
  sortDir?: SortDirection;
}

const SortIndicator: React.FC<SortIndicatorProps> = ({ isSortable, sortDir }) => {
  if (!isSortable) return null;
  if (sortDir === 'asc') return <ChevronUp size={14} className="inline ml-1" />;
  if (sortDir === 'desc') return <ChevronDown size={14} className="inline ml-1" />;
  return <ChevronsUpDown size={14} className="inline ml-1 text-slate-300 dark:text-slate-600" />;
};

export function DataTable<T>({
  tableId,
  data,
  columns,
  rowKey,
  onRowClick,
  animate = true,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  emptyState,
  toolbarLeft,
  className,
}: DataTableProps<T>) {
  const { config: columnsConfig, updateConfig } = useColumnConfig(tableId, columns);

  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>('asc');
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [configPanelOpen, setConfigPanelOpen] = React.useState(false);

  const visibleColumns = React.useMemo(() => {
    if (!columnsConfig || Object.keys(columnsConfig).length === 0) {
      return columns.filter((c) => c.defaultVisible !== false);
    }
    return columns.filter((c) => columnsConfig[c.key]?.visible !== false);
  }, [columns, columnsConfig]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;

    const sorted = [...data].sort((a, b) => {
      const valA = col.sortValue!(a);
      const valB = col.sortValue!(b);

      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const cmp = strA.localeCompare(strB);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [data, sortKey, sortDir, columns]);

  React.useEffect(() => {
    setPage(0);
  }, [data.length]);

  const paginatedData = React.useMemo(
    () => sortedData.slice(page * pageSize, (page + 1) * pageSize),
    [sortedData, page, pageSize]
  );

  const stickyStyles = React.useMemo(
    () => computeStickyStyles(visibleColumns, columnsConfig, false),
    [visibleColumns, columnsConfig]
  );

  const stickyHeaderStyles = React.useMemo(
    () => computeStickyStyles(visibleColumns, columnsConfig, true),
    [visibleColumns, columnsConfig]
  );

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (!col.sortValue) return;

    if (sortKey === col.key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  return (
    <RadixTooltip.Provider>
      <Card className={cn('overflow-hidden', className)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex-1">{toolbarLeft}</div>
          <ColumnConfigPanel
            columns={columns}
            columnsConfig={columnsConfig}
            onConfigChange={updateConfig}
            open={configPanelOpen}
            onOpenChange={setConfigPanelOpen}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead className="bg-slate-50/70 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/50 font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky top-0 z-10">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleHeaderClick(col)}
                    className={cn(
                      'px-3 py-2 font-bold uppercase tracking-wider text-xs text-slate-400 dark:text-slate-500',
                      col.sortValue && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                      col.className
                    )}
                    style={{
                      ...stickyHeaderStyles.get(col.key),
                      minWidth: col.minWidth ? `${col.minWidth}px` : 'auto',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{col.header}</span>
                      <SortIndicator isSortable={!!col.sortValue} sortDir={sortKey === col.key ? sortDir : undefined} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <AnimatePresence mode="popLayout">
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, i) => {
                    const key = rowKey(row, page * pageSize + i);
                    const Row = animate ? motion.tr : 'tr';

                    return (
                      <Row
                        key={key}
                        layout={false}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={cn('group hover:bg-slate-50/50 dark:hover:bg-slate-900/30', onRowClick && 'cursor-pointer')}
                        onClick={() => onRowClick?.(row)}
                      >
                        {visibleColumns.map((col) => (
                          <td
                            key={`${key}-${col.key}`}
                            className={cn(
                              'px-3 py-2 text-xs text-slate-700 dark:text-slate-300',
                              col.className,
                              !columnsConfig[col.key]?.pin && 'group-hover:bg-slate-50/50 dark:group-hover:bg-slate-900/30'
                            )}
                            style={{
                              ...stickyStyles.get(col.key),
                              minWidth: col.minWidth ? `${col.minWidth}px` : 'auto',
                            }}
                          >
                            {col.cell(row)}
                          </td>
                        ))}
                      </Row>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length} className="p-8 text-center">
                      {emptyState ? (
                        emptyState(visibleColumns.length)
                      ) : (
                        <div className="text-slate-400 text-sm">No data to display</div>
                      )}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={page}
          pageSize={pageSize}
          totalRows={sortedData.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>
    </RadixTooltip.Provider>
  );
}
