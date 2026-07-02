// This file contains schedule and session dates that vary per course.

export const MOCK_DATES = {
  todayStr: new Date(Date.now()).toLocaleDateString(),
  nextWeekStr: new Date(Date.now() + 86400000 * 7).toLocaleDateString(),
  nextTwoWeeksStr: new Date(Date.now() + 86400000 * 14).toLocaleDateString(),
};