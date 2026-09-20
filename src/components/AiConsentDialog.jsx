import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";

const GROQ_PRIVACY_URL = "https://groq.com/privacy-policy";

export default function AiConsentDialog({
  open,
  title = "Before using an AI suggestion",
  description = "Brain Dump will send the text of this selected thought to Groq, an external AI provider, to suggest Do, Decide, or Let Go. No other thoughts are sent.",
  thoughtTexts = [],
  thoughtText = "",
  confirmLabel = "I understand — send thought",
  onCancel,
  onConfirm
}) {
  const previewThoughts = thoughtTexts.length > 0
    ? thoughtTexts
    : thoughtText
      ? [thoughtText]
      : [];

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="ai-consent-title"
      aria-describedby="ai-consent-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="ai-consent-title">{title}</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <DialogContentText id="ai-consent-description">
          {description}
        </DialogContentText>

        {previewThoughts.length > 0 && (
          <Box
            component={previewThoughts.length === 1 ? "blockquote" : "ol"}
            sx={{
              m: 0,
              p: 2,
              pl: previewThoughts.length === 1 ? 2 : 4,
              borderLeft: "3px solid",
              borderColor: "primary.light",
              borderRadius: 1,
              bgcolor: "#f6f8f3",
              color: "text.primary",
              overflowWrap: "anywhere",
              whiteSpace: "pre-wrap"
            }}
          >
            {previewThoughts.length === 1
              ? previewThoughts[0]
              : previewThoughts.map((text, index) => <li key={`${index}-${text}`}>{text}</li>)}
          </Box>
        )}

        <Alert severity="info" variant="outlined">
          Groq may process or retain request data under the team's GroqCloud settings and
          policies. Avoid sending sensitive personal information. Your consent choice is
          remembered only in this browser.
        </Alert>

        <DialogContentText>
          Review Groq's{" "}
          <Link href={GROQ_PRIVACY_URL} target="_blank" rel="noreferrer noopener">
            privacy policy
          </Link>
          .
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" onClick={onCancel}>Not now</Button>
        <Button variant="contained" onClick={onConfirm}>{confirmLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
