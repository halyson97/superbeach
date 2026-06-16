import { useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

interface ShareButtonProps {
  shareToken?: string;
  fullWidth?: boolean;
}

export function ShareButton({ shareToken, fullWidth = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!shareToken) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/acompanhar/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt('Copie o link para compartilhar:', url);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ShareIcon />}
        onClick={handleShare}
        fullWidth={fullWidth}
      >
        Compartilhar jogo
      </Button>
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Link copiado! Envie para outras pessoas acompanharem o jogo."
      />
    </>
  );
}
