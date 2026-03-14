import type { CategoryNode } from '@/types/category';
import {
  transformToSidebarData,
  transformToSmartContent,
} from '@/utils/adapter/categoryAdapter';

describe('categoryAdapter', () => {
  it('maps sidebar and resolves icon by exact/fuzzy/default slug rules', () => {
    const nodes: CategoryNode[] = [
      { id: '1', name: 'Phones', slug: 'dien-thoai-phu-kien', children: [] },
      { id: '2', name: 'Fashion Men', slug: 'thoi-trang-nam-ao', children: [] },
      { id: '3', name: 'Unknown', slug: 'something-else', children: [] },
    ];

    const result = transformToSidebarData(nodes);

    expect(result[0]?.icon).toBe('smartphone');
    expect(result[1]?.icon).toBe('checkroom');
    expect(result[2]?.icon).toBe('category');
  });

  it('creates smart fallback section when parent has no children', () => {
    const parent: CategoryNode = {
      id: 'parent-1',
      name: 'Home',
      slug: 'nha-cua-noi-that',
      imagePath: null,
      imageExtension: null,
      children: [],
    };

    const result = transformToSmartContent(parent);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('virtual-sub-parent-1');
    expect(result[0]?.title).toBe('Home');
    expect(result[0]?.items[0]?.name).toContain('Home');
  });
});
