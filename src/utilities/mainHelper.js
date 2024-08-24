export function modifiedSignum(vector) {
    return vector.map(feature => {
        if (feature <= 0) return 0;
        else return 1;
    });
};

