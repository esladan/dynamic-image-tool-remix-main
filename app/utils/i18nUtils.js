/**
 * @param {{ enable: any; submit?: boolean; productId: any; productHandle: any; productData: any; image: any; colorTypes: any; assignColorTypeHover?: {}; errors?: {}; componentField: any; }} data
 */
export async function refactorData(data) {
    const dataFields = {
        productId: data?.productId,
        productHandle: data?.productHandle,
        productData: JSON.stringify(data?.productData),
    }
    switch (data?.componentField) {
        case 'enable':
            dataFields.enable = data?.enable;
            break;
        case 'image':
            dataFields.image = JSON.stringify({
                orignalImage: data?.image?.orignalImage,
                shapeRegions: data?.image?.shapeRegions,
                assignedColorType: data?.image?.assignedColorType,
            });
            break;
        case 'colorTypes':
            dataFields.colorTypes = JSON.stringify(data?.colorTypes);
            break;
    }
    if (data?.componentField !== '') {
        dataFields.componentField = data?.componentField;
    }
    return dataFields;
}

export function generateUniqueId() {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 11);
    return `${timestamp}_${random}`;
}

export function getRandomOffColor(data) {
    const getRandomValue = () => Math.floor(Math.random() * 128) + 128; // Random value between 128 and 255 for a lighter color

    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    const generateColor = () => {
        const red = getRandomValue();
        const green = getRandomValue();
        const blue = getRandomValue();

        const hexRed = componentToHex(red);
        const hexGreen = componentToHex(green);
        const hexBlue = componentToHex(blue);

        return `#${hexRed}${hexGreen}${hexBlue}`;
    };

    let newColor = generateColor();

    // Check if the color already exists
    while (data?.colorTypes?.some(el => el.colorCode === newColor)) {
        newColor = generateColor();
    }

    return newColor;
}

// Fill the regions in the specified shape with the selected color
export const fillRegion = (data, shapeKey, color) => {
    const canvas = data?.canvasRef?.current;
    const ctx = canvas.getContext('2d');
    const regions = data?.image?.shapeRegions[shapeKey];

    regions.forEach(region => {
        const { x, y } = region;
        // Fill the region with the selected color
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
    });
}

export const removeColorTypeShapeRegions = (data, refKey, complete = false) => {
    for (let shapeKey of Object.keys(data?.image?.assignedColorType ?? {})) {
        const assigned = data?.image?.assignedColorType[shapeKey];
        if (data?.colorTypes[refKey].id === assigned?.refId) {
            fillRegion(data, shapeKey, complete ? '#ffffff' : assigned?.colorCode);
        }
    }
}

export const removeColorShapeRegion = (data, refKey) => {
    for (let shapeKey of Object.keys(data?.image?.assignedColorType ?? {})) {
        if (data?.colorTypes[refKey].id === data?.image?.assignedColorType[shapeKey]?.refId) {
            fillRegion(data, shapeKey, '#ffffff');
        }
    }
}

export const resetShapeRegions = (data, complete = false) => {
    for (const shapeKey in data?.image?.shapeRegions) {
        if (complete) {
            fillRegion(data, shapeKey, '#ffffff');
        } else {
            const assigned = data?.image?.assignedColorType[shapeKey];
            fillRegion(data, shapeKey, assigned?.colorCode || '#ffffff');
        }
    }
}

export const base64ImageLoad = async (data, encodedImg) => {
    /** @type {any} */
    const img = new Image();
    img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        /** @type {any} */
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        tempCtx.drawImage(img, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        const pixels = imageData.data;
        const threshold = 128;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
            const newColor = grayscale >= threshold ? 255 : 0;

            pixels[i] = newColor;
            pixels[i + 1] = newColor;
            pixels[i + 2] = newColor;
        }

        tempCtx.putImageData(imageData, 0, 0);
        /** @type {any} */
        const canvas = data?.canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

        loadSelectedShapes(data);
    };
    img.src = encodedImg;
}

// Load selected shapes
const loadSelectedShapes = (data) => {
    const assignedColorType = data?.image?.assignedColorType ?? {};
    for (let shapeKey of Object.keys(assignedColorType)) {
        fillRegion(data, shapeKey, assignedColorType[shapeKey]?.colorCode);
    }
}