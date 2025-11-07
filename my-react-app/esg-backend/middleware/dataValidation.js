const db = require('../database/db');

const validateESGData = async (req, res, next) => {
  const { category, metric, value, unit } = req.body;
  
  const rule = await new Promise((resolve) => {
    db.get('SELECT * FROM validation_rules WHERE metric_name = ? AND category = ?', 
      [metric, category], (err, row) => resolve(row));
  });

  const errors = [];
  
  if (!value || isNaN(value)) errors.push('Invalid value');
  if (rule) {
    if (value < rule.min_value || value > rule.max_value) {
      errors.push(rule.error_message);
    }
    if (rule.required_unit && unit !== rule.required_unit) {
      errors.push(`Expected unit: ${rule.required_unit}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  req.validatedData = { category, metric, value: parseFloat(value), unit };
  next();
};

module.exports = { validateESGData };