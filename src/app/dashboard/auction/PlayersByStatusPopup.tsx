"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayerTradingCard from "@/components/PlayerTradingCard";
import { ApiPlayer } from "@/types/player";

interface PlayersByStatusPopupProps {
  open: boolean;
  onClose: () => void;
  upcomingPlayers: ApiPlayer[];
  unsoldPlayers: ApiPlayer[];
  soldPlayers: ApiPlayer[];
  loading: boolean;
}

const PlayersByStatusPopup: React.FC<PlayersByStatusPopupProps> = ({
  open,
  onClose,
  upcomingPlayers,
  unsoldPlayers,
  soldPlayers,
  loading,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl" // adjust width as needed
      PaperProps={{
        sx: {
          height: "90vh",
          width: "90vw",
          m: "auto",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Players by Status
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Upcoming Players */}
            <Typography variant="h6" gutterBottom>
              Upcoming
            </Typography>
            <Grid container spacing={2}>
              {upcomingPlayers.length > 0 ? (
                upcomingPlayers.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player._id}>
                    <PlayerTradingCard player={player} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>No upcoming players</Typography>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Unsold Players */}
            <Typography variant="h6" gutterBottom>
              Unsold
            </Typography>
            <Grid container spacing={2}>
              {unsoldPlayers.length > 0 ? (
                unsoldPlayers.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player._id}>
                    <PlayerTradingCard player={player} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>No unsold players</Typography>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Sold Players */}
            <Typography variant="h6" gutterBottom>
              Sold
            </Typography>
            <Grid container spacing={2}>
              {soldPlayers.length > 0 ? (
                soldPlayers.map((player) => (
                  <Grid item xs={12} sm={6} md={4} key={player._id}>
                    <PlayerTradingCard player={player} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography>No sold players</Typography>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayersByStatusPopup;
