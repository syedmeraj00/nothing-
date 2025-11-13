// Simple localStorage utility
export const saveData = (data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem('esgData') || '[]');
    existingData.push(data);
    localStorage.setItem('esgData', JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const getStoredData = () => {
  try {
    return JSON.parse(localStorage.getItem('esgData') || '[]');
  } catch (error) {
    console.error('Error getting data:', error);
    return [];
  }
};