import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  // Pagination
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
    },
  }),
};

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyIcon,
  emptyMessage = 'Nenhum registro encontrado',
  emptyDescription,
  onRowClick,
  rowClassName,
  page = 1,
  totalPages = 1,
  total,
  onPageChange,
}: DataTableProps<T>) {
  const showPagination = onPageChange && totalPages > 1;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-muted-foreground"
                    >
                      {emptyIcon || <Database className="mb-3 h-10 w-10 opacity-50" />}
                      <p className="font-medium">{emptyMessage}</p>
                      {emptyDescription && (
                        <p className="text-sm mt-1">{emptyDescription}</p>
                      )}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                data.map((item, index) => {
                  const key = keyExtractor(item);
                  const className =
                    typeof rowClassName === 'function'
                      ? rowClassName(item)
                      : rowClassName;

                  return (
                    <motion.tr
                      key={key}
                      custom={index}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'group border-b transition-colors hover:bg-muted/50',
                        onRowClick && 'cursor-pointer',
                        className
                      )}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render
                            ? column.render(item)
                            : (item as Record<string, unknown>)[column.key]?.toString()}
                        </TableCell>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-2"
        >
          <p className="text-sm text-muted-foreground">
            {total !== undefined ? (
              <>
                <span className="font-medium">{total}</span> registro(s)
              </>
            ) : (
              `Página ${page} de ${totalPages}`
            )}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DataTable;
