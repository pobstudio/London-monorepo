export type Line = [Cord, Cord];

export type Rect = [Cord, Cord];
export type Triangle = [Cord, Cord, Cord];
export type RectByTriangle = [Triangle, Triangle];
export type RectByCorner = [Cord, Cord, Cord, Cord];

export type Bound = [number, number];
export type Range = [number, number];
export type Vec2 = [number, number];
export type Cord = [number, number];
export type Vec3 = [number, number, number];
export type Cord3 = Vec3;
export type Vec4 = [number, number, number, number];
export type Quad = [Cord, Cord, Cord, Cord];
export type Color = [number, number, number, number];