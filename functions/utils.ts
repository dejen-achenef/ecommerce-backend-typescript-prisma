// Utility functions

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const paginate = <T>(array: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
    },
  };
};

