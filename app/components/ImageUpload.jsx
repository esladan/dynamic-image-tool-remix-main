import { DropZone, EmptyState, Card, VerticalStack, Icon, Tooltip } from '@shopify/polaris';
import { useState, useCallback, useRef, useEffect } from 'react';
import { CancelMajor } from '@shopify/polaris-icons';
import { base64ImageLoad, fillRegion } from '~/utils/i18nUtils';

export function ImageUpload({ formState, setFormState }) {
    const canvasRef = useRef(null);
    const [hoverShape, setHoverShape] = useState(null);
    const [lastHoverShape, setLastHoverShape] = useState(null);

    // Remove the current image
    const removeImage = () => {
        setFormState({ ...formState, image: {} });
        /**
         * @type {any}
         */
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Handle document mousemove event
    useEffect(() => {
        const handleMouseMove = (event) => {
            /**
            * @type {any}
            */
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            if (mouseX < 0 || mouseY < 0 || mouseX > canvas.width || mouseY > canvas.height) {
                setHoverShape(null);
            }
        };
        document.addEventListener('mousemove', handleMouseMove);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        if (hoverShape !== lastHoverShape) {
            if (lastHoverShape) {
                const assigned = formState?.image?.assignedColorType[lastHoverShape];
                fillRegion(formState, lastHoverShape, assigned?.colorCode || '#ffffff');
            }

            if (hoverShape) {
                fillRegion(formState, hoverShape, formState?.assignColorTypeHover?.colorCode);
            }

            setLastHoverShape(hoverShape);
        }
    }, [hoverShape]);

    // Handle canvas mousemove event
    const handleCanvasMouseMove = (event) => {
        if (Object.keys(formState?.assignColorTypeHover).length) {
            /**
            * @type {any}
            */
            const canvas = canvasRef?.current;
            const canvasRect = canvas?.getBoundingClientRect();

            const x = event?.clientX - canvasRect?.left;
            const y = event?.clientY - canvasRect?.top;

            /**
             * @type {any}
             */
            const shapeKey = findShape(x, y);
            shapeKey ? setHoverShape(shapeKey) : setHoverShape(null);
        }
    }

    // handle canvas click event
    const handleCanvasClick = (event) => {
        if (Object.keys(formState?.assignColorTypeHover).length) {
            /**
            * @type {any}
            */
            const canvas = canvasRef.current;
            const canvasRect = canvas.getBoundingClientRect();

            const x = event.clientX - canvasRect.left;
            const y = event.clientY - canvasRect.top;

            // Find the shape containing the clicked region
            const shapeKey = findShape(x, y);

            // Fill the clicked region in the shape with the selected color
            if (shapeKey) {
                // Update formState object the filled color for the region
                const image = { ...formState?.image };
                image.assignedColorType[shapeKey] = formState.assignColorTypeHover;
                setFormState({
                    ...formState,
                    image: image,
                    componentField: "image",
                    submit: true
                })

                // Fill color in region
                fillRegion(formState, shapeKey, formState?.assignColorTypeHover?.colorCode);
            }
        }
    }

    const handleDropZoneDrop = useCallback(
        (_dropFile, acceptedFile, _rejectedFile) => {
            let errors = {};
            errors.image = _rejectedFile.length ? `${_rejectedFile[0]?.name}" is not supported. File type must be .jpeg.` : null;
            errors.productId = !formState?.productId ? 'Please select Product.' : null;
            setFormState({ ...formState, errors: errors });

            if (!(errors.productId || errors.image)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const orignalImage = e?.target?.result;
                    const img = new Image();
                    img.onload = () => {
                        const tempCanvas = document.createElement('canvas');
                        /**
                         * @type {any}
                         */
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
                        /**
                         * @type {any}
                         */
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

                        let regions = detectShapes();
                        setFormState({
                            ...formState, image: {
                                orignalImage: orignalImage,
                                editedImage: tempCanvas,
                                shapeRegions: regions,
                                assignedColorType: {},
                                preview: false
                            },
                            errors: errors,
                            componentField: "image",
                            submit: true
                        })
                    };
                    // @ts-ignore
                    img.src = orignalImage;
                };

                reader.readAsDataURL(acceptedFile[0]);
            }
        },
        [formState],
    );

    // Detect shapes in the image
    const detectShapes = () => {
        let shapeRegions = {};
        /**
        * @type {any}
        */
        const canvas = canvasRef.current;
        const visited = new Array(canvas.width * canvas.height * 4).fill(false);

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const pixelIndex = (y * canvas.width + x) * 4;

                if (!visited[pixelIndex]) {
                    const shapeKey = `shape${Object.keys(shapeRegions).length + 1}`;
                    const regions = [];

                    floodFill(x, y, visited, shapeKey, regions);

                    if (regions.length > 0) {
                        shapeRegions[shapeKey] = regions;
                    }
                }
            }
        }

        return shapeRegions;
    };

    // Flood fill algorithm to detect shapes
    const floodFill = (x, y, visited, shapeKey, regions) => {
        /**
        * @type {any}
        */
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const queue = [];
        const initialPixelIndex = (y * canvas.width + x) * 4;

        if (visited[initialPixelIndex]) {
            return;
        }

        const targetColor = [255, 255, 255, 255]; // White color
        const replacementColor = [0, 0, 0, 255]; // Black color

        // Check if the initial pixel color matches the target color
        if (!colorsMatch(pixels, initialPixelIndex, targetColor)) {
            return;
        }

        // Add initial pixel to the queue and mark it as visited
        queue.push([x, y]);
        visited[initialPixelIndex] = true;

        while (queue.length > 0) {
            /**
             * @type {any}
             */
            const [currentX, currentY] = queue.shift();
            const currentPixelIndex = (currentY * canvas.width + currentX) * 4;

            // Check if the current pixel color matches the target color
            if (colorsMatch(pixels, currentPixelIndex, targetColor)) {
                // Fill the current pixel with the replacement color
                pixels[currentPixelIndex] = replacementColor[0];
                pixels[currentPixelIndex + 1] = replacementColor[1];
                pixels[currentPixelIndex + 2] = replacementColor[2];
                pixels[currentPixelIndex + 3] = replacementColor[3];

                // Add the current pixel to the regions array
                regions.push({ x: currentX, y: currentY });

                // Check the neighboring pixels
                const neighbors = getNeighbors(currentX, currentY);
                for (const neighbor of neighbors) {
                    const [nx, ny] = neighbor;
                    const neighborPixelIndex = (ny * canvas.width + nx) * 4;

                    if (!visited[neighborPixelIndex] && colorsMatch(pixels, neighborPixelIndex, targetColor)) {
                        // Add neighboring pixel to the queue and mark it as visited
                        queue.push([nx, ny]);
                        visited[neighborPixelIndex] = true;
                    }
                }
            }
        }
    }

    // Check if two colors match
    const colorsMatch = (pixels, pixelIndex, targetColor) => {
        const tolerance = 10; // Adjust the tolerance value as needed

        for (let i = 0; i < 3; i++) {
            if (Math.abs(pixels[pixelIndex + i] - targetColor[i]) > tolerance) {
                return false;
            }
        }

        return true;
    }

    // Get neighboring pixels of a given pixel
    const getNeighbors = (x, y) => {
        /**
        * @type {any}
        */
        const canvas = canvasRef.current;
        const neighbors = [];

        if (x > 0) {
            neighbors.push([x - 1, y]);
        }
        if (x < canvas.width - 1) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0) {
            neighbors.push([x, y - 1]);
        }
        if (y < canvas.height - 1) {
            neighbors.push([x, y + 1]);
        }

        return neighbors;
    }

    /**
    * Find the shape containing the specified coordinates
    * @return {string|null}
    */
    const findShape = (/** @type {number} */ x, /** @type {number} */ y) => {
        let shapeRegions = formState?.image?.shapeRegions;
        for (const shapeKey in shapeRegions) {
            const regions = shapeRegions[shapeKey];
            for (let i = 0; i < regions.length; i++) {
                const region = regions[i];
                if (region.x === x && region.y === y) {
                    return shapeKey;
                }
            }
        }
        return null;
    }

    // Load image, shapes, color on canvas
    useEffect(() => {
        if (formState.componentField == "productload" && Object.keys(formState?.image).length && formState?.image?.orignalImage) {
            setFormState({ ...formState, componentField: '' });
            // Load Image on product selection
            base64ImageLoad(formState, formState?.image?.orignalImage);
        }

        if (formState.canvasRef == null) {
            setFormState({ ...formState, canvasRef: canvasRef });
        }
    }, [formState]);

    return (
        <Card>
            <div style={{ display: !Object.keys(formState?.image).length ? 'block' : 'none' }}>
                <DropZone
                    accept="image/jpeg"
                    type="image"
                    allowMultiple={false}
                    errorOverlayText="File type must be .jpeg"
                    onDrop={handleDropZoneDrop}
                >
                    <EmptyState image="upload.png" >
                        <p>Drag and drop, or <a href="#">browse</a> your file</p>
                    </EmptyState>
                </DropZone>
            </div>
            <div style={{ display: Object.keys(formState?.image).length ? 'block' : 'none' }}>
                <VerticalStack inlineAlign="end">
                    <Tooltip content="Remove Image">
                        <div style={{ cursor: 'pointer' }} onClick={removeImage}>
                            <Icon source={CancelMajor} color="base" />
                        </div>
                    </Tooltip>
                </VerticalStack>
                <VerticalStack inlineAlign='center'>
                    <canvas onMouseMove={handleCanvasMouseMove} onClick={handleCanvasClick} ref={canvasRef} />
                </VerticalStack>
            </div>
        </Card>
    );
}