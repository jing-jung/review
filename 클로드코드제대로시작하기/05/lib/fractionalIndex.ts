import { generateKeyBetween } from 'fractional-indexing';

/**
 * 두 키 사이의 fractional index 키를 생성합니다.
 * @param a 이전 키 (없으면 null)
 * @param b 다음 키 (없으면 null)
 */
export function getOrderBetween(a: string | null = null, b: string | null = null): string {
  try {
    return generateKeyBetween(a, b);
  } catch (err) {
    // 혹시라도 정렬 충돌 시 기본 접두사 활용
    return a ? `${a}0` : 'a0';
  }
}
