"use client";

import React from "react";
import { GridOverlay } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import Image from "next/image";

export default function CustomNoRowsOverlay() {
  return (
    <GridOverlay>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Image
          src="/no-data.svg"
          alt="No Data"
          width={120}
          height={120}
          style={{ marginBottom: 8 }}
        />
      </Box>
    </GridOverlay>
  );
}
