import { createTheme } from "@mui/material/styles";

// Material 3-inspired semantic roles for the Brain Dump brand. Component and
// layout CSS consume the matching --bd-* custom properties injected by
// CssBaseline so literal colors stay in one implementation layer.
const colors = {
  primary: "#3d604b",
  onPrimary: "#ffffff",
  primaryContainer: "#dce9d8",
  onPrimaryContainer: "#1f392a",
  secondary: "#6f5b2f",
  onSecondary: "#ffffff",
  secondaryContainer: "#f4e4bd",
  onSecondaryContainer: "#3a2d0f",
  tertiary: "#71596f",
  tertiaryContainer: "#f3e2f0",
  onTertiaryContainer: "#3f2d3d",
  surface: "#fffdf8",
  surfaceDim: "#e8e7df",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f6f5ee",
  surfaceContainer: "#f0f1e9",
  surfaceContainerHigh: "#e9ede4",
  surfaceContainerHighest: "#e2e7de",
  onSurface: "#253b32",
  onSurfaceVariant: "#5f6d65",
  outline: "#77837b",
  outlineVariant: "#d2dbd0",
  error: "#984f3d",
  onError: "#ffffff",
  errorContainer: "#ffdad0",
  onErrorContainer: "#3b0a00",
  success: "#52795a",
  warning: "#8a671f"
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
      light: "#75967d",
      dark: "#2d4c3a",
      contrastText: colors.onPrimary
    },
    secondary: {
      main: colors.secondary,
      light: "#a4864a",
      dark: "#57451f",
      contrastText: colors.onSecondary
    },
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: {
      main: colors.error,
      light: "#b0694f",
      dark: "#763a2d",
      contrastText: colors.onError
    },
    background: {
      default: colors.surfaceContainerLow,
      paper: colors.surface
    },
    text: {
      primary: colors.onSurface,
      secondary: colors.onSurfaceVariant
    },
    divider: colors.outlineVariant
  },
  shape: { borderRadius: 12 },
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
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--bd-primary": colors.primary,
          "--bd-on-primary": colors.onPrimary,
          "--bd-primary-container": colors.primaryContainer,
          "--bd-on-primary-container": colors.onPrimaryContainer,
          "--bd-secondary": colors.secondary,
          "--bd-secondary-container": colors.secondaryContainer,
          "--bd-on-secondary-container": colors.onSecondaryContainer,
          "--bd-tertiary": colors.tertiary,
          "--bd-tertiary-container": colors.tertiaryContainer,
          "--bd-on-tertiary-container": colors.onTertiaryContainer,
          "--bd-surface": colors.surface,
          "--bd-surface-lowest": colors.surfaceContainerLowest,
          "--bd-surface-low": colors.surfaceContainerLow,
          "--bd-surface-container": colors.surfaceContainer,
          "--bd-surface-high": colors.surfaceContainerHigh,
          "--bd-surface-highest": colors.surfaceContainerHighest,
          "--bd-on-surface": colors.onSurface,
          "--bd-on-surface-variant": colors.onSurfaceVariant,
          "--bd-outline": colors.outline,
          "--bd-outline-variant": colors.outlineVariant,
          "--bd-error": colors.error,
          "--bd-error-container": colors.errorContainer,
          "--bd-on-error-container": colors.onErrorContainer,
          "--bd-success": colors.success,
          "--bd-warning": colors.warning,
          "--bd-category-unsorted": "#68716a",
          "--bd-category-do": "#52795a",
          "--bd-category-decide": "#8a671f",
          "--bd-category-let-go": "#71596f",
          "--bd-shape-small": "8px",
          "--bd-shape-medium": "12px",
          "--bd-shape-large": "20px",
          "--bd-shape-extra-large": "28px"
        },
        body: {
          color: colors.onSurface,
          backgroundColor: colors.surfaceContainerLow
        },
        "*:focus-visible": {
          outline: `3px solid ${colors.primary}`,
          outlineOffset: 3
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 14,
          paddingInline: 18,
          paddingBlock: 9,
          fontSize: "0.8125rem"
        },
        sizeSmall: {
          minHeight: 40,
          paddingInline: 14,
          paddingBlock: 7,
          fontSize: "0.75rem"
        },
        contained: {
          boxShadow: "0 3px 10px rgba(45, 76, 58, 0.18)"
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#2d4c3a" }
        },
        outlined: {
          borderColor: colors.outlineVariant,
          color: colors.onPrimaryContainer,
          backgroundColor: colors.surfaceContainerLow,
          "&:hover": {
            backgroundColor: colors.primaryContainer,
            borderColor: colors.primary
          }
        },
        text: {
          color: colors.onPrimaryContainer,
          "&:hover": { backgroundColor: colors.primaryContainer }
        },
        textError: {
          color: colors.error,
          "&:hover": { backgroundColor: colors.errorContainer }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          borderRadius: 12,
          color: colors.error,
          "&:hover": { backgroundColor: colors.errorContainer }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 48 },
        indicator: { display: "none" }
      }
    },
    MuiTab: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          minHeight: 48,
          minWidth: 146,
          padding: "10px 15px",
          borderRadius: 11,
          color: colors.onSurfaceVariant,
          fontWeight: 700,
          "&:hover": {
            backgroundColor: colors.surfaceContainer,
            color: colors.onSurface
          },
          "&.Mui-selected": {
            backgroundColor: colors.primary,
            color: colors.onPrimary,
            boxShadow: "0 3px 10px rgba(45, 76, 58, 0.14)"
          }
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { gap: 8, flexWrap: "wrap" }
      }
    },
    MuiToggleButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          padding: "7px 14px",
          borderRadius: 10,
          border: `1px solid ${colors.outlineVariant}`,
          backgroundColor: colors.surfaceContainerLowest,
          color: colors.onSurfaceVariant,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.8125rem",
          "&:hover": { backgroundColor: colors.surfaceContainer },
          "&.Mui-selected": {
            borderColor: colors.primary,
            backgroundColor: colors.primary,
            color: colors.onPrimary,
            "&:hover": { backgroundColor: "#2d4c3a" }
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
            backgroundColor: colors.surfaceContainerLowest,
            fontSize: "0.875rem",
            "& fieldset": { borderColor: colors.outlineVariant },
            "&:hover fieldset": { borderColor: colors.outline },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary,
              borderWidth: 2
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
          color: colors.onSurfaceVariant,
          "&.Mui-focused": { color: colors.primary }
        }
      }
    },
    MuiFormControl: {
      defaultProps: { size: "small" }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 12,
          backgroundColor: colors.surfaceContainerLowest,
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: colors.onSurface,
          "& fieldset": { borderColor: colors.outlineVariant },
          "&:hover fieldset": { borderColor: colors.outline }
        },
        icon: { color: colors.onSurfaceVariant }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { minHeight: 44, fontSize: "0.875rem" }
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
        rounded: { borderRadius: 16 }
      }
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiAlert-root": {
            borderRadius: 14,
            backgroundColor: colors.onSurface,
            color: colors.surface
          }
        }
      }
    }
  }
});

export default theme;
