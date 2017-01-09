

export namespace Helpers {


    /**
         * Returns a random integer between min (inclusive) and max (inclusive)
         * Using Math.round() will give you a non-uniform distribution!
         */
    export function getRandomInt(max: number, min: number = 0) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function isArray(o: any) {
        return (o instanceof Array);
    }

    export function isObjectButNotArray(o: any) {
        return typeof o === 'object' && !isArray(o)
    }

}