export function useEuclideanDistance(vector) {
    return Math.sqrt(
        vector.reduce((accumlator, currentValue) => accumlator + currentValue ** 2, 0)
    );
};
export function useNormalizedVector(vector) {
    const euclideanDistance = useEuclideanDistance(vector);
    return vector.map((currentvalue) => currentvalue / euclideanDistance);
};

export function clampToCosineRange(value) {
    return Math.max(Math.min(value, 1), -1);
};

export function useDotProduct({ vector1, vector2 }, normlaizeVector = true) {
    if (normlaizeVector) {
        vector1 = useNormalizedVector(vector1);
        vector2 = useNormalizedVector(vector2);
    };
    const unclampedDotProductResult = vector1.reduce((accumlator, currentValue, currentIndex) => accumlator + (currentValue * vector2[currentIndex]), 0);
    return clampToCosineRange(unclampedDotProductResult);
};
