// src/utils/storage.js

// Save a single ESG data entry
export const saveData = (entry) => {
  const existing = JSON.parse(localStorage.getItem("esgData")) || [];
  localStorage.setItem("esgData", JSON.stringify([...existing, entry]));
};

// Save multiple entries (e.g., from Excel upload)
export const saveMultiple = (entries) => {
  const existing = JSON.parse(localStorage.getItem("esgData")) || [];
  localStorage.setItem("esgData", JSON.stringify([...existing, ...entries]));
};

// Get all stored ESG data
export const getStoredData = () => {
  return JSON.parse(localStorage.getItem("esgData")) || [];
};

// Initialize ESG storage if empty
export const initializeStorage = () => {
  if (!localStorage.getItem("esgData")) {
    localStorage.setItem("esgData", JSON.stringify([]));
  }
};

// Recalculate KPIs and save them
export const calculateAndSaveKPIs = () => {
  const data = getStoredData();
  const total = data.length;

  let envScore = 0, socScore = 0, govScore = 0;
  let envCount = 0, socCount = 0, govCount = 0;

  data.forEach(item => {
    const value = parseFloat(item.value);
    if (isNaN(value)) return;

    switch (item.category.toLowerCase()) {
      case 'environmental':
        envScore += value;
        envCount++;
        break;
      case 'social':
        socScore += value;
        socCount++;
        break;
      case 'governance':
        govScore += value;
        govCount++;
        break;
      default:
        break;
    }
  });

  const avg = (score, count) => (count === 0 ? 0 : Math.round(score / count));
  const KPIs = {
    overallScore: avg(envScore + socScore + govScore, envCount + socCount + govCount),
    environmental: avg(envScore, envCount),
    social: avg(socScore, socCount),
    governance: avg(govScore, govCount),
    totalEntries: total,
  };

  localStorage.setItem("esgKPIs", JSON.stringify(KPIs));
  return KPIs;
};
