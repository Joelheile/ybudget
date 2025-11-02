import { MOCK_CATEGORY_GROUPS } from "../../app/components/data/mockCategories";

export function createCategoryMap(): Map<string, string> {
  const categoryMap = new Map();
  MOCK_CATEGORY_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      categoryMap.set(item.value, item.label);
    });
  });
  return categoryMap;
}
