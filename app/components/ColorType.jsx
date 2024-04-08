import { Button, TextField } from "@shopify/polaris";
import { useState } from "react";
import { generateUniqueId, getRandomOffColor } from "~/utils/i18nUtils";

export function ColorType({ formState, setFormState }) {

    const [addColorType, setAddColorType] = useState('');
    const [addColorTypeError, setAddColorTypeError] = useState('');

    const handleAddColorType = () => {
        let errors = {};
        errors.productId = !formState?.productId ? 'Please select Product.' : null;
        errors.image = Object.keys(formState?.image).length ? null : 'Please choose the image.';
        if (errors.productId || errors.image) {
            setFormState({ ...formState, errors: errors });
            return;
        }

        if (addColorType.length < 3 || addColorType.length > 12) {
            setAddColorTypeError('Text must be between 3 and 12 characters long.');
            return;
        }
        // @ts-ignore
        if (formState?.colorTypes?.some(colorType => colorType?.name.toLocaleLowerCase() === addColorType.toLocaleLowerCase())) {
            setAddColorTypeError('Color Type name should be unique');
        } else {
            setAddColorTypeError('');
            const newColor = getRandomOffColor(formState);

            setFormState({
                // @ts-ignore
                ...formState, colorTypes: [...formState?.colorTypes, {
                    id: generateUniqueId(),
                    name: addColorType,
                    colorCode: newColor,
                    colors: []
                }], errors: {}, componentField: "colorTypes", submit: true
            })
            setAddColorType('');
        }
    };
    return (
        <TextField
            label
            type="text"
            value={addColorType}
            autoComplete="off"
            placeholder="Add color type"
            suffix={
                <div style={{ marginRight: "-12px" }}>
                    <Button fullWidth={true} onClick={handleAddColorType} primary>Add</Button>
                </div>
            }
            onChange={value => { setAddColorType(value); setAddColorTypeError(''); }}
            error={addColorTypeError}
        />
    );
}