export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', type: 'expense', color: '#F97316', icon: '🍔', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#3B82F6', icon: '🚗', isDefault: true },
  { name: 'Housing', type: 'expense', color: '#8B5CF6', icon: '🏠', isDefault: true },
  { name: 'Utilities', type: 'expense', color: '#06B6D4', icon: '💡', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#EC4899', icon: '🎬', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#EAB308', icon: '🛍️', isDefault: true },
  { name: 'Healthcare', type: 'expense', color: '#10B981', icon: '🏥', isDefault: true },
  { name: 'Other', type: 'expense', color: '#6B7280', icon: '📦', isDefault: true },
  { name: 'Salary', type: 'income', color: '#22C55E', icon: '💼', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#14B8A6', icon: '💻', isDefault: true },
  { name: 'Investments', type: 'income', color: '#6366F1', icon: '📈', isDefault: true },
  { name: 'Other Income', type: 'income', color: '#84CC16', icon: '💰', isDefault: true },
];

export async function seedDefaultCategories(client, userId) {
  for (const cat of DEFAULT_CATEGORIES) {
    await client.query(
      `INSERT INTO categories (user_id, name, type, color, icon, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, cat.name, cat.type, cat.color, cat.icon, cat.isDefault]
    );
  }
}
