import moment from 'moment';

export const timeDiff = (inTime: moment.MomentInput, outTime: moment.MomentInput) => {
  // If in_time or out_time are invalid or null, return '0 Min'
  if (!inTime || !outTime) return '0 Min';

  // Parse the times using moment.js to handle time formatting and calculations
  const inMoment = moment(inTime, 'HH:mm A'); // Adjust the format based on your time format
  const outMoment = moment(outTime, 'HH:mm A'); // Same format as inTime

  // Calculate the difference in minutes
  const duration = moment.duration(outMoment.diff(inMoment));
  const minutes = duration.asMinutes();

  // If you want to return the result as a formatted string in hours and minutes
  const hours = Math.floor(minutes / 60); // Get the hours part
  const mins = minutes % 60; // Get the remaining minutes part

  return `${hours}h ${mins}m`; // Returning in hours and minutes
};

export const convertHoursToReadableFormat = (hours: number): string => {
  const wholeHours = Math.floor(hours); // Extract the whole number part (hours)
  const fractionalPart = hours - wholeHours; // Get the fractional part
  const minutes = Math.round(fractionalPart * 60); // Convert fractional part to minutes

  // Check if minutes exist
  return minutes === 0
    ? `${wholeHours} hr`
    : `${wholeHours} hr, ${minutes} min`;
};

// convert minutes to
export const convertMinutesToReadableFormat = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`; // If less than 1 hour, return only minutes

  const hours = Math.floor(minutes / 60); // Get whole hours
  const remainingMinutes = minutes % 60; // Get remaining minutes

  return remainingMinutes === 0
    ? `${hours} hr`
    : `${hours} hr, ${remainingMinutes} min`;
};
