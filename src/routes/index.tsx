import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchData, Person } from "../fetchData";
import { z } from "zod";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: z.object({
    pageIndex: z.number().optional().default(0),
    pageSize: z.number().optional().default(10),
  }),
});

function HomeComponent() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        header: "Name",
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: "firstName",
            cell: (info) => info.getValue(),
            footer: (props) => props.column.id,
          },
          {
            accessorFn: (row) => row.lastName,
            id: "lastName",
            cell: (info) => info.getValue(),
            header: () => <span>Last Name</span>,
            footer: (props) => props.column.id,
          },
        ],
      },
      {
        header: "Info",
        footer: (props) => props.column.id,
        columns: [
          {
            accessorKey: "age",
            header: () => "Age",
            footer: (props) => props.column.id,
          },
          {
            header: "More Info",
            columns: [
              {
                accessorKey: "visits",
                header: () => <span>Visits</span>,
                footer: (props) => props.column.id,
              },
              {
                accessorKey: "status",
                header: "Status",
                footer: (props) => props.column.id,
              },
              {
                accessorKey: "progress",
                header: "Profile Progress",
                footer: (props) => props.column.id,
              },
            ],
          },
        ],
      },
    ],
    [],
  );
  const navigate = useNavigate();
  const { pageIndex, pageSize } = Route.useSearch();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: pageIndex as number,
    pageSize: pageSize as number,
  });

  React.useEffect(() => {
    navigate({
      to: "./",
      search: {
        pageIndex: pagination.pageIndex as number,
        pageSize: pagination.pageSize as number,
      },
    }).catch(console.error);
  }, [pagination, navigate]);

  const dataQuery = useQuery({
    queryKey: ["data", pagination],
    queryFn: () => fetchData(pagination),
    placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
  });

  const defaultData = React.useMemo(() => [], []);

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    // pageCount: dataQuery.data?.pageCount ?? -1, //you can now pass in `rowCount` instead of pageCount and `pageCount` will be calculated internally (new in v8.13.0)
    rowCount: dataQuery.data?.rowCount, // new in v8.13.0 - alternatively, just pass in `pageCount` directly
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, //we're doing manual "server-side" pagination
    // getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
    debugTable: true,
  });

  return (
    <div className="p-2">
      <div className="h-2" />
      <div className="table-responsive">
        <table className="table table-striped text-nowrap">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="p-3 text-sm font-semibold tracking-wide text-left"
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="h-2" />
      <TablePagination table={table} isFetching={dataQuery.isFetching} rowCount={dataQuery.data?.rowCount.toLocaleString()} />
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <pre>{JSON.stringify(pagination, null, 2)}</pre>
    </div>
  );
}
function TablePagination({ table, isFetching, rowCount }:{table:any, isFetching:boolean, rowCount?:string}) {
  return (
    <div>
      <nav className="navbar navbar-expand-md navbar-light  justify-content-between pt-4"
        aria-label="Table navigation">
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0 d-block w-100 md-inline md:w-auto">
          Showing <span
            className="font-weight-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> of <span
              className="font-weight-bold text-gray-900 dark:text-white">{table.getPageCount().toLocaleString()}</span>
          <span> {isFetching ? "Loading..." : null}</span>
        </span>
        <ul className="navbar-nav inline-flex me-0 -me-md-2">
          <li className="nav-item">
            <button
              className="btn btn-light nav-link"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </button>
          </li>

          <li className="nav-item">
            <button
              className="btn btn-primary-light"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-primary-light"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-light nav-link"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              Last
            </button>
          </li>
        </ul>
      </nav>
    </div>)
}