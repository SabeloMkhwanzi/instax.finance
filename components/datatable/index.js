import { useEffect, useRef, forwardRef } from "react";
import _ from "lodash";
import { useTable, useSortBy, usePagination, useRowSelect } from "react-table";
import {
  BiChevronDown,
  BiChevronUp,
  BiLeftArrowAlt,
  BiRightArrowAlt,
} from "react-icons/bi";

import { PageWithText, Pagination } from "../paginations";
import { toArray } from "../../lib/utils";

const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();

  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return (
    <input
      ref={resolvedRef}
      type="checkbox"
      {...rest}
      className="w-4 h-4 form-checkbox"
    />
  );
});

export default ({
  columns,
  size,
  data,
  rowSelectEnable = false,
  defaultPageSize = 10,
  pageSizes = [10, 25, 50, 100],
  noPagination = false,
  noRecordPerPage = false,
  className = "",
  style,
}) => {
  const tableRef = useRef();
  const {
    getTableProps,
    getTableBodyProps,
    rows,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: defaultPageSize,
      },
      disableSortRemove: true,
      stateReducer: (newState, action, prevState) =>
        action.type.startsWith("reset") ? prevState : newState,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) =>
        [
          rowSelectEnable
            ? {
                id: "selection",
                Header: ({ getToggleAllRowsSelectedProps }) => (
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                ),
                Cell: ({ row }) => (
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                ),
              }
            : undefined,
          ...columns,
        ].filter((c) => c)
      );
    }
  );

  useEffect(() => {
    if (pageIndex + 1 > pageCount) {
      gotoPage(pageCount - 1);
    }
  }, [pageIndex, pageCount]);

  const loading = toArray(data).findIndex((d) => d.skeleton) > -1;

  return (
    <>
      <table
        ref={tableRef}
        {...getTableProps()}
        className={`table border dark:border-slate-700  rounded-xl ${className}`}
        style={{
          ...style,
        }}
      >
        <thead>
          {headerGroups.map((hg) => (
            <tr {...hg.getHeaderGroupProps()}>
              {hg.headers.map((c, i) => (
                <th
                  {...c.getHeaderProps(c.getSortByToggleProps())}
                  className={`${
                    i === 0
                      ? "rounded-tl-xl border dark:border-slate-700"
                      : i === hg.headers.length - 1
                      ? "rounded-tr-xl border dark:border-slate-700"
                      : ""
                  } ${c.className || ""}`}
                >
                  <div
                    className={`flex flex-row items-center ${
                      c.headerClassName?.includes("justify-")
                        ? ""
                        : "justify-start"
                    } ${c.headerClassName || ""}`}
                  >
                    <span>{c.render("Header")}</span>
                    {c.isSorted && (
                      <span className="ml-1.5">
                        {c.isSortedDesc ? (
                          <BiChevronDown className="stroke-current" />
                        ) : (
                          <BiChevronUp className="stroke-current" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {(noPagination ? rows : page).map((row, i) => {
            prepareRow(row);

            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell, j) => (
                  <td
                    {...cell.getCellProps()}
                    className={_.head(headerGroups)?.headers[j]?.className}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!noPagination && data?.length > 0 && (
        <div
          className={`flex flex-col items-center ${
            noRecordPerPage || pageCount > 4
              ? "sm:flex-row justify-center"
              : "sm:grid sm:grid-cols-3 justify-between"
          } gap-4 my-0.5`}
        >
          {!noRecordPerPage && (
            <select
              disabled={loading}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-24 px-3 py-2 text-center rounded shadow outline-none appearance-none cursor-pointer form-select bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border-zinc-100 dark:border-zinc-900"
            >
              {pageSizes.map((s, i) => (
                <option key={i} value={s} className="text-xs font-medium">
                  Show {s}
                </option>
              ))}
            </select>
          )}
          {pageCount > 1 && pageCount <= 4 && (
            <div className="space-x-1 my-2.5 sm:my-0 mx-auto">
              <span>Page</span>
              <span className="font-bold">{pageIndex + 1}</span>
              <span>of</span>
              <span className="font-bold">{pageOptions.length}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end space-x-2 pagination">
            {pageCount > 4 ? (
              <div className="flex flex-col sm:flex-row items-center justify-center mt-2.5 sm:mt-0">
                <Pagination
                  items={[...Array(pageCount).keys()]}
                  disabled={loading}
                  active={pageIndex + 1}
                  previous={<BiLeftArrowAlt size={16} />}
                  next={<BiRightArrowAlt size={16} />}
                  onClick={(p) => {
                    gotoPage(p - 1);
                    // tableRef.current.scrollIntoView()
                  }}
                  icons={true}
                  className="space-x-0.5"
                />
              </div>
            ) : (
              <>
                {pageIndex !== 0 && (
                  <PageWithText
                    size={size}
                    disabled={loading}
                    onClick={() => {
                      gotoPage(0);
                      tableRef.current.scrollIntoView();
                    }}
                  >
                    <span className="font-bold text-black dark:text-white">
                      First
                    </span>
                  </PageWithText>
                )}
                {canPreviousPage && (
                  <PageWithText
                    size={size}
                    disabled={loading}
                    onClick={() => {
                      previousPage();
                      // tableRef.current.scrollIntoView()
                    }}
                  >
                    Previous
                  </PageWithText>
                )}
                {canNextPage && (
                  <PageWithText
                    size={size}
                    disabled={!canNextPage || loading}
                    onClick={() => {
                      nextPage();
                      // tableRef.current.scrollIntoView()
                    }}
                  >
                    Next
                  </PageWithText>
                )}
                {pageIndex !== pageCount - 1 && (
                  <PageWithText
                    size={size}
                    disabled={!canNextPage || loading}
                    onClick={() => {
                      gotoPage(pageCount - 1);
                      tableRef.current.scrollIntoView();
                    }}
                  >
                    <span className="font-bold text-black dark:text-white">
                      Last
                    </span>
                  </PageWithText>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
