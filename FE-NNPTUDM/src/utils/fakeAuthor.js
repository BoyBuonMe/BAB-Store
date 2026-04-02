const FIRST_NAMES = [
  "Minh", "Lan", "Hùng", "Linh", "Tuấn", "Mai", "Đức", "Hà", "Phong", "Ngọc",
  "Khoa", "Trang", "Bảo", "Yến", "Thiện", "Cẩm", "Quân", "Thảo", "Duy", "Kim",
];
const LAST_NAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ",
];

const AVATAR_COLORS = [
  "#7c3aed", "#0891b2", "#059669", "#dc2626",
  "#d97706", "#db2777", "#2563eb", "#65a30d",
];

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Tác giả fake cố định theo seed (vd: id bài viết) — không đổi mỗi lần render.
 */
export function getFakeAuthor(seed) {
  const n = Number(seed) || 1;
  const rand = seededRandom(n * 7919);
  const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const color = AVATAR_COLORS[Math.floor(rand() * AVATAR_COLORS.length)];
  return {
    name: `${lastName} ${firstName}`,
    initials: `${firstName[0]}${lastName[0]}`,
    color,
  };
}
