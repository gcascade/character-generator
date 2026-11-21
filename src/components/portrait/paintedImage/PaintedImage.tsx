import { Box, Chip, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import { useT } from '../../../i18n';

type PaintedImageProps = {
  image: string;
  alt: string;
  height: string | number;
  width: string | number;
  /** Shows "may be outdated" when the character changed since painting (research R4). */
  outdated?: boolean;
  crop?: boolean;
  zoomable?: boolean;
};

/** A portrait painted by AI (spec 011), framed like the default portraits. */
const PaintedImage: FC<PaintedImageProps> = ({
  image,
  alt,
  height,
  width,
  outdated = false,
  crop = false,
  zoomable = true,
}) => {
  const t = useT();
  const open = () => {
    // Data URLs cannot be opened directly in a new tab: show them in a blank page.
    const page = window.open();
    if (page) {
      page.document.title = alt;
      page.document.body.style.margin = '0';
      const img = page.document.createElement('img');
      img.src = image;
      img.alt = alt;
      img.style.maxWidth = '100%';
      page.document.body.appendChild(img);
    }
  };

  return (
    <Box sx={{ position: 'relative', width, height }}>
      <Box
        component="img"
        className="character-portrait"
        src={image}
        alt={alt}
        onClick={zoomable ? open : undefined}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: zoomable ? 'zoom-in' : 'inherit',
          objectFit: crop ? 'cover' : 'contain',
          objectPosition: crop ? 'center 20%' : 'center',
          bgcolor: 'background.paper',
        }}
      />
      {outdated && (
        <Tooltip title={t('portrait.outdatedHint')}>
          <Chip
            size="small"
            label={t('portrait.outdated')}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: 1,
              borderColor: 'divider',
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default PaintedImage;
