import { createTheme } from "@mui/material/styles";

// Custom light theme that preserves the existing sage green + warm beige
// visual language and pill-rounded control geometry while handing all
// interactive controls over to Material UI.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3d604b",
      light: "#75967d",
      dark: "#2d4c3a",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#a4864a",
      light: "#c8a96d",
      dark: "#7a5f30",
      contrastText: "#ffffff"
    },
    success: { main: "#75a47a" },
    warning: { main: "#d4aa52" },
    error: { main: "#984f3d", light: "#b0694f", dark: "#763a2d" },
    background: {
      default: "#f6f5ee",
      paper: "#ffffff"
    },
    text: {
      primary: "#253b32",
      secondary: "#64716a"
    },
    divider: "#d8e0d3"
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    button: {
      textTransform: "none",
      fontWeight: 700,
      letterSpacing: 0
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          paddingBlock: 8,
          fontSize: "0.8125rem"
        },
        sizeSmall: {
          paddingInline: 14,
          paddingBlock: 6,
          fontSize: "0.75rem"
        },
        contained: {
          boxShadow: "0 4px 12px rgba(61, 96, 75, 0.18)"
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#2d4c3a" }
        },
        outlined: {
          borderColor: "#d8dfd3",
          color: "#42583e",
          backgroundColor: "#f0f3ed",
          "&:hover": {
            backgroundColor: "#e2e9dc",
            borderColor: "#cdd9c7"
          }
        },
        text: {
          color: "#42583e",
          "&:hover": { backgroundColor: "#edf3e9" }
        },
        textError: {
          color: "#935845",
          "&:hover": { backgroundColor: "#fbefeb" }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          color: "#9a5946",
          "&:hover": { backgroundColor: "#fbefeb" }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 0
        },
        indicator: {
          display: "none"
        }
      }
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          minHeight: 0,
          minWidth: 146,
          padding: "10px 15px",
          borderRadius: 11,
          color: "#68756c",
          fontWeight: 700,
          "&:hover": {
            backgroundColor: "#f0f4ed",
            color: "#3c5846"
          },
          "&.Mui-selected": {
            backgroundColor: "#3e604b",
            color: "#ffffff",
            boxShadow: "0 5px 14px rgba(61, 96, 75, 0.14)"
          }
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 8,
          flexWrap: "wrap"
        }
      }
    },
    MuiToggleButton: {
      defaultProps: {
        disableRipple: true
      },
      styleOverrides: {
        root: {
          padding: "7px 13px",
          borderRadius: 999,
          border: "1px solid #d8dfd3",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          color: "#5e6d63",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.8125rem",
          "&:hover": {
            backgroundColor: "#edf2e9"
          },
          "&.Mui-selected": {
            borderColor: "#3e5d49",
            backgroundColor: "#3e5d49",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#34493c"
            }
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
        size: "small"
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#fafbf8",
            fontSize: "0.875rem",
            "& fieldset": { borderColor: "#d8dfd4" },
            "&:hover fieldset": { borderColor: "#8ca283" },
            "&.Mui-focused fieldset": {
              borderColor: "#799671",
              borderWidth: 1
            }
          },
          "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
            padding: "12px 14px"
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          color: "#5a655c",
          "&.Mui-focused": { color: "#3d604b" }
        }
      }
    },
    MuiFormControl: {
      defaultProps: {
        size: "small"
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: "#f5f8f2",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#294137",
          "& fieldset": { borderColor: "#ccd7c7" },
          "&:hover fieldset": { borderColor: "#8ca283" }
        },
        icon: { color: "#425d49" }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        multiline: {
          padding: "12px 14px",
          "& textarea": { padding: 0 }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 14
        }
      }
    }
  }
});

export default theme;
