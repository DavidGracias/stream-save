import type { SxProps, Theme } from '@mui/material/styles';

export type NavKey = 'home' | 'manage' | 'configure' | 'default';

const MANAGE = {
  borderColor: 'secondary.main',
  hoverBg: 'rgba(253, 121, 168, 0.28)',
  activeBg: 'rgba(255, 255, 255, 0.08)',
};

const CONFIGURE = {
  borderColor: '#00BFAE',
  hoverBg: 'rgba(0, 191, 174, 0.1)',
  activeBg: 'rgba(255, 255, 255, 0.08)',
};

const DEFAULTS = {
  borderColor: 'divider',
  hoverBg: 'rgba(108, 92, 231, 0.1)',
  activeBg: 'transparent',
};

export function getNavButtonSx(isActive: boolean, key: NavKey): SxProps<Theme> {
  const cfg = key === 'manage' ? MANAGE : key === 'configure' ? CONFIGURE : DEFAULTS;
  const showBorder = isActive && key !== 'home';
  return {
    borderRadius: 2,
    px: 3,
    py: 1,
    fontWeight: 600,
    minWidth: 120,
    justifyContent: 'center',
    border: key === 'home' ? undefined : (showBorder ? '2px solid' : '2px solid transparent'),
    borderColor: key === 'home' ? undefined : (showBorder ? cfg.borderColor : 'transparent'),
    backgroundColor: isActive ? cfg.activeBg : 'transparent',
    '&:hover': {
      border: key === 'home' ? undefined : '2px solid',
      borderColor: key === 'home' ? undefined : cfg.borderColor,
      backgroundColor: cfg.hoverBg,
    },
  } as SxProps<Theme>;
}


