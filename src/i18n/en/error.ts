export const error = {
  '1000': 'Base path not found! {{configPath}} is probably corrupted.',
  '1001': 'Selected directory {{directory}} already exists',
  '1100': 'Failed to initiate kill signal for python server',
  '1101': 'Timeout: Python server did not exit within 10 seconds',
  '1102': 'Python process exited with code {{code}} and signal {{signal}}',
  '1103': 'Python Server Failed To Start Within Timeout.',
} as const;
