import { encode } from "https://gnlow.dev/upng@0.1.0"
import { arr } from "https://gnlow.dev/util@0.1.0"

export type Coord = [number, number]
export type Vec4 = [number, number, number, number]

export abstract class ReadablePlane<T> {
    abstract w: number
    abstract h: number
    abstract get(coord: Coord): T | undefined
    
    grayscale(this: ReadablePlane<number>) {
        return this.map(x => x == undefined ? undefined : [x, x, x, x] satisfies Vec4)
    }
    toPng(this: ReadablePlane<Vec4>) {
        return new Uint8Array(encode(
            [new Uint8Array(
                arr(this.h).flatMap(y =>
                    arr(this.w).flatMap(x =>
                        this.get([x, y])
                        || [0, 0, 0, 0]
                    )
                )
            ).buffer],
            this.w,
            this.h,
            0,
        ))
    }
    map<O>(f: (i: T | undefined, coord: Coord) => O | undefined) {
        return new FunPlane(
            this.w,
            this.h,
            c => f(this.get(c), c),
        )
    }
}

export class Plane<T> extends ReadablePlane<T> {
    constructor(
        readonly w: number,
        readonly h: number,
        readonly raw = new Map<string, T>,
    ) {
        super()
    }
    
    set(coord: Coord, v: T) {
        return this.raw.set(coord.join(";"), v)
    }
    get(coord: Coord) {
        return this.raw.get(coord.join(";"))
    }
}

export class FunPlane<T> extends ReadablePlane<T> {
    constructor(
        readonly w: number,
        readonly h: number,
        readonly f: (coord: Coord) => T | undefined,
    ) {
        super()
    }
    get(coord: Coord) {
        return this.f(coord)
    }
}
