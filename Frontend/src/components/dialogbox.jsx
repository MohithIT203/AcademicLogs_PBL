import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function CommonDialog({
  open,
  setOpen,
  title,
  children,
  onSave,
  saveText = "Save",
  cancelText = "Cancel",
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="text-blue-700 font-semibold">
        {title}
      </DialogTitle>

      <DialogContent dividers>
        {children}
      </DialogContent>

      <DialogActions className="p-4">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          {cancelText}
        </button>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {saveText}
        </button>
      </DialogActions>
    </Dialog>
  );
}
