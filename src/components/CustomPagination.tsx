"use client";

import React from "react";
import {
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageSizeSelector,
  gridRowCountSelector,
} from "@mui/x-data-grid";
import { Box, Typography, Select, MenuItem, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SelectChangeEvent } from "@mui/material/Select";

function CustomPagination() {
  const apiRef = useGridApiContext();
  // Ensure default pageSize is defined
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageSize = useGridSelector(apiRef, gridPageSizeSelector) || 10;
  const rowCount = useGridSelector(apiRef, gridRowCountSelector) || 0;
  const totalPages = Math.ceil(rowCount / pageSize);

  const handlePageChange = (newPage: number) => {
    apiRef.current.setPage(newPage);
  };

  const handlePageSizeChange = (
    event: SelectChangeEvent<number>,
    child: React.ReactNode
  ) => {
    apiRef.current.setPageSize(Number(event.target.value));
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        p: 0.25,
        fontSize: "0.75rem",
      }}
    >
      {/* Rows per page label */}
      <Typography variant="body2" sx={{ mr: 0.5 }}>
        Rows per page:
      </Typography>
      <Select
        value={pageSize}
        onChange={handlePageSizeChange}
        size="small"
        sx={{
          mr: 1,
          minWidth: 40,
          height: "1.5rem",
          fontSize: "0.75rem",
          "& .MuiSelect-select": { padding: "0.25rem 0.5rem" },
        }}
      >
        <MenuItem value={5} sx={{ fontSize: "0.75rem" }}>
          5
        </MenuItem>
        <MenuItem value={10} sx={{ fontSize: "0.75rem" }}>
          10
        </MenuItem>
        <MenuItem value={50} sx={{ fontSize: "0.75rem" }}>
          50
        </MenuItem>
      </Select>
      {/* Page info */}
      <Typography variant="body2" sx={{ mr: 1 }}>
        Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
      </Typography>
      {/* Navigation arrows */}
      <IconButton
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 0}
        size="small"
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages - 1}
        size="small"
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default CustomPagination;
