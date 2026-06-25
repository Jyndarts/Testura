const success = (data, message = 'Success') => ({
  success: true,
  data,
  message,
});

const error = (message = 'Error', data = null) => ({
  success: false,
  data,
  message,
});

module.exports = { success, error };
