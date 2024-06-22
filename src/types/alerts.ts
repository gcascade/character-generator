export type Alert = {
  id: number;
  severity: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
};
