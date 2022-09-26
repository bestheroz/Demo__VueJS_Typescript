export default Object.freeze({
  PRODUCT_TITLE: import.meta.env.VITE_PRODUCT_TITLE as string,
  PRODUCT_VERSION: import.meta.env.VITE_PRODUCT_VERSION as string,
  API_HOST: import.meta.env.VITE_BASE_API_URL as string,
  FILE_API_HOST: import.meta.env.VITE_FILE_API_HOST as string,
  // Locale
  LOCALE: import.meta.env.VITE_LOCALE as string,
  DATE_FORMAT_STRING: import.meta.env.VITE_DATE_FORMAT_STRING as string,
  DATETIME_FORMAT_STRING: import.meta.env.VITE_DATETIME_FORMAT_STRING as string,
  TIME_FORMAT_STRING: import.meta.env.VITE_TIME_FORMAT_STRING as string,
  DATETIME_MINUTE_FORMAT_STRING: import.meta.env
    .VITE_DATETIME_MINUTE_FORMAT_STRING as string,
  TIME_MINUTE_FORMAT_STRING: import.meta.env
    .VITE_TIME_MINUTE_FORMAT_STRING as string,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string,
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT as string,
  // DataTables
  FOOTER_PROPS_MAX_100: {
    showFirstLastPage: true,
    itemsPerPageOptions: [10, 20, 50, 100],
  },
});
