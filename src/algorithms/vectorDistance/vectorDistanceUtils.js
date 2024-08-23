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

export function useDotProduct({ vector1, vector2 }) {
    const normalizedVector1 = useNormalizedVector(vector1);
    const normalizedVector2 = useNormalizedVector(vector2);
    const unclampedDotProductResult = normalizedVector1.reduce((accumlator, currentValue, currentIndex) => accumlator + (currentValue * normalizedVector2[currentIndex]), 0);
    return clampToCosineRange(unclampedDotProductResult);
};
