export const SPECIAL_DATES = [
  "2025-01-01",
  "2025-02-05",
  "2025-03-21",
  "2025-05-01",
  "2025-09-16",
  "2025-11-20",
  "2025-12-25",
];

/**
 * Check if a date is weekend (Saturday or Sunday)
 * @param {Date} date - The date to check
 * @returns {boolean} - True if weekend
 */
export const isWeekend = (date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Check if a date is in the special dates array
 * @param {Date} date - The date to check
 * @param {string[]} customSpecialDates - Optional custom special dates array
 * @returns {boolean} - True if special date
 */
export const isSpecialDate = (date, customSpecialDates = []) => {
  const allSpecialDates = [...SPECIAL_DATES, ...customSpecialDates];

  // Fix: Use local date format instead of ISO string to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  console.log("Checking date:", dateString, "against:", allSpecialDates); // Debug log

  return allSpecialDates.includes(dateString);
};

/**
 * Check if a date is today
 * @param {Date} date - The date to check
 * @returns {boolean} - True if today
 */
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} - True if in the past
 */
export const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Main validation function that returns all date information
 * @param {Date|string} dateInput - Date to validate (Date object or ISO string)
 * @param {string[]} customSpecialDates - Optional custom special dates
 * @returns {Object} - Object containing validation results and messages
 */
export const validateDate = (dateInput, customSpecialDates = []) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date provided");
  }

  const weekend = isWeekend(date);
  const specialDate = isSpecialDate(date, customSpecialDates);
  const today = isToday(date);
  const pastDate = isPastDate(date);

  // Generate appropriate messages
  let message = "";
  let type = "normal"; // normal, weekend, special, past

  if (pastDate) {
    message = "⚠️ This date is in the past";
    type = "past";
  } else if (specialDate) {
    message = "🎉 Special event day - Check for special schedules!";
    type = "special";
  } else if (weekend) {
    message = "📅 Weekend - Extended hours may apply";
    type = "weekend";
  } else {
    message = "✅ Regular business day";
    type = "normal";
  }

  return {
    date,
    isWeekend: weekend,
    isSpecialDate: specialDate,
    isToday: today,
    isPastDate: pastDate,
    message,
    type,
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    formattedDate: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
};
