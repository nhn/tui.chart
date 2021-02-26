const RAD = Math.PI / 180;
const ANGLE_90 = 90;
export const ANGLE_CANDIDATES = [0, 25, 45, 65, 85, 90];
/**
 * Calculate adjacent.
 *
 *   H : Hypotenuse
 *   A : Adjacent
 *   O : Opposite
 *   D : Degree
 *
 *        /|
 *       / |
 *    H /  | O
 *     /   |
 *    /\ D |
 *    -----
 *       A
 */
function calculateAdjacent(degree, hypotenuse) {
    return Math.cos(degree * RAD) * hypotenuse;
}
function calculateOpposite(degree, hypotenuse) {
    return Math.sin(degree * RAD) * hypotenuse;
}
export function calculateRotatedWidth(degree, width, height) {
    const centerHalf = calculateAdjacent(degree, width / 2);
    const sideHalf = calculateAdjacent(ANGLE_90 - degree, height / 2);
    return (centerHalf + sideHalf) * 2;
}
export function calculateRotatedHeight(degree, width, height) {
    const centerHalf = calculateOpposite(degree, width / 2);
    const sideHalf = calculateOpposite(ANGLE_90 - degree, height / 2);
    return (centerHalf + sideHalf) * 2;
}
