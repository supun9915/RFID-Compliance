const listeners = new Set();

export const notifyResponse = (payload) => {
  listeners.forEach((listener) => listener(payload));
};

export const subscribeToResponseNotifications = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
