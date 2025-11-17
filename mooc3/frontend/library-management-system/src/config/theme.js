// src/config/theme.js
export const themeConfig = {
  token: {
    // Màu chủ đạo
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    fontSize: 14,
    
    // Border radius
    borderRadius: 6,
    
    // Spacing
    padding: 16,
    margin: 16,
  },
  components: {
    // Tùy chỉnh Button
    Button: {
      controlHeight: 36,
      fontSize: 14,
      borderRadius: 6,
    },
    // Tùy chỉnh Input
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    // Tùy chỉnh Table
    Table: {
      headerBg: '#fafafa',
      headerColor: '#000',
      borderRadius: 6,
    },
    // Tùy chỉnh Card
    Card: {
      borderRadius: 8,
    },
  },
};
