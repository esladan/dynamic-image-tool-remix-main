import { Grid, LegacyCard, Button, VerticalStack, Text, HorizontalStack, Icon, TextField, Scrollable, HorizontalGrid, InlineError, RadioButton } from "@shopify/polaris";
import { CancelMajor, DeleteMajor } from '@shopify/polaris-icons';
import { useState } from 'react';
import { fillRegion, removeColorTypeShapeRegions } from "../utils/i18nUtils";

export function ColorTypeBox({ refKey, formState, setFormState }) {
    const [editColorType, setEditColorType] = useState(false);
    const [colorTypeError, setColorTypeError] = useState('');
    const [colorTypeValue, setColorTypeValue] = useState(formState?.colorTypes[refKey]?.name);
    const [addcolorvalue, setAddColorValue] = useState('');
    const [addColorError, setAddColorError] = useState('');
    const [editingIndex, setEditingIndex] = useState(-1);
    const [colorNameValue, setColorNameValue] = useState();
    const [colorCodeValue, setColorCodeValue] = useState();
    const [colorCodeError, setColorCodeError] = useState('');
    const [colorNameError, setColorNameError] = useState('');

    const updateColorType = () => {
        if (colorTypeValue.length < 3 || colorTypeValue.length > 12) {
            setColorTypeError('Text must be between 3 and 12 characters long.');
            return;
        } else if (formState?.colorTypes?.some((colorType, index) => index != refKey && colorType?.name.toLocaleLowerCase() === colorTypeValue.toLocaleLowerCase())) {
            setColorTypeError('Color Type name should be unique');
            return;
        } else {
            setColorTypeError('');
            setEditColorType(false);
            const colorTypes = [...formState?.colorTypes];
            colorTypes[refKey].name = colorTypeValue;
            setFormState({ ...formState, colorTypes: colorTypes, componentField: "colorTypes", submit: true });
        }
    }

    const addColor = () => {
        const colorName = addcolorvalue.trim();
        if (colorName.length < 3 || colorName.length > 12) {
            setAddColorError('Text must be between 3 and 12 characters long.');
            return;
        }
        const colorTypes = [...formState?.colorTypes];
        if (colorTypes[refKey]?.colors?.some(color => color['name'].toLowerCase() === colorName.toLowerCase())) {
            setAddColorError('Color name should be unique');
        } else {
            colorTypes[refKey].colors?.push({
                name: colorName,
                code: '#ffffff',
                selected: false
            })
            setAddColorValue('');
            setFormState({ ...formState, colorTypes: colorTypes, errors: {}, componentField: "colorTypes", submit: true });
        }
    }

    const handleEditingColorCode = (value) => {
        if (/^#([0-9A-Fa-f]{6})$/.test(value)) {
            setColorCodeError('');
        } else {
            setColorCodeError('Invalid color code.');
        }

        setColorCodeValue(value);
    }

    const handleUpdateingColorCode = () => {
        if (!colorCodeError) {
            const colorTypes = [...formState?.colorTypes];
            colorTypes[refKey].colors[editingIndex].code = colorCodeValue;
            setFormState({ ...formState, colorTypes: colorTypes, componentField: "colorTypes", submit: true });
        }
    }

    const handleEditingColorName = (value) => {
        const colorName = value.trim();
        if (colorName !== '') {
            const colorTypes = [...formState?.colorTypes];
            if (colorTypes[refKey]?.colors?.[editingIndex].name.toLowerCase() != colorName.toLowerCase() && colorTypes[refKey]?.colors?.some(color => color['name'].toLowerCase() === colorName.toLowerCase())) {
                setColorNameError('Color name should be unique');

            } else {
                setColorNameError('');
            }
        }
        setColorNameValue(value);
    }

    const handleUpdateingColorName = () => {
        if (!colorNameError) {
            const colorTypes = [...formState?.colorTypes];
            colorTypes[refKey].colors[editingIndex].name = colorNameValue;
            setFormState({ ...formState, colorTypes: colorTypes, componentField: "colorTypes", submit: true });
        }
    }

    const handleDeleteColor = (index) => {
        const colorTypes = [...formState?.colorTypes];
        colorTypes[refKey].colors = colorTypes[refKey]?.colors?.filter((_, i) => i !== index);
        setEditingIndex(-1);
        setFormState({
            ...formState,
            colorTypes: colorTypes,
            componentField: "colorTypes",
            submit: true
        });
        removeColorTypeShapeRegions(formState, refKey);
    }

    const handleEditRevert = () => {
        if (!(colorCodeError || colorNameError)) {
            setEditingIndex(-1);
        }
    }

    const handleEdit = (index, color) => {
        if (!(colorCodeError || colorNameError)) {
            setColorCodeValue(color.code);
            setColorNameValue(color.name);
            setEditingIndex(index);
        }
    }

    const handleAssignColorType = (assignValue) => {
        if (Object.keys(formState?.image ?? {}).length < 1) {
            setFormState({ ...formState, errors: { image: 'Please choose the image first.' } });
            return;
        }

        if (
            formState?.assignColorTypeHover?.name == assignValue?.name &&
            formState?.assignColorTypeHover?.colorCode == assignValue?.colorCode
        ) {
            setFormState({
                ...formState, assignColorTypeHover: {},
                image: { ...formState?.image, preview: false },
                errors: {}
            });
        } else {
            setFormState({
                ...formState, assignColorTypeHover: {
                    name: assignValue.name,
                    colorCode: assignValue.colorCode,
                    refId: assignValue.id
                },
                image: { ...formState?.image, preview: false },
                errors: {}
            });
        }
    }

    const handleSelectColor = (key) => {
        const colorTypes = [...formState?.colorTypes];
        colorTypes[refKey].colors = colorTypes[refKey].colors?.map((color, index) => {
            return { ...color, selected: index === key ? true : false };
        });

        setFormState({ 
            ...formState,
            colorTypes: colorTypes,
            errors: {}
        });

        if (formState?.image?.preview) {
            for (let shapeKey of Object.keys(formState?.image?.assignedColorType)) {
                const assignedColorType = formState?.image?.assignedColorType[shapeKey];
                const color = formState?.colorTypes?.find(o => o.id === assignedColorType.refId)?.colors?.find(o => o.selected === true);
                if (color?.code) {
                    fillRegion(formState, shapeKey, color?.code);
                }
            }
        }
    }

    const handleDeleteColorType = (refKey) => {
        const image = { ...formState?.image }
        if (Object.keys(image?.assignedColorType ?? {}).length) {
            image.assignedColorType = Object.entries(formState?.image?.assignedColorType ?? {})
                .filter(([_, shape]) => shape.refId !== formState?.colorTypes[refKey].id)
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        }

        setFormState({
            ...formState,
            assignColorTypeHover: {},
            colorTypes: [...formState?.colorTypes.filter((_, i) => i !== refKey)],
            image: image,
            componentField: "colorTypes",
            submit: true
        });

        removeColorTypeShapeRegions(formState, refKey);
    }

    return (
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 6 }}>
            <LegacyCard sectioned>
                <VerticalStack gap="5">
                    <VerticalStack inlineAlign="end">
                        <div style={{ cursor: 'pointer' }} onClick={() => handleDeleteColorType(refKey)}>
                            <Icon source={CancelMajor} color="base" />
                        </div>
                    </VerticalStack>
                    {
                        editColorType ? <TextField
                            label=""
                            labelHidden={true}
                            value={colorTypeValue}
                            onChange={value => { setColorTypeValue(value); setColorTypeError(''); }}
                            onBlur={updateColorType}
                            autoFocus
                            error={colorTypeError}
                            autoComplete="off"
                        /> : <HorizontalStack>
                            <img
                                src="edit-pen.svg"
                                width={18}
                                style={{ cursor: "pointer", marginRight: '6px' }}
                                onClick={() => setEditColorType(!editColorType)}
                            />
                            <Text as="p">{colorTypeValue}</Text>
                        </HorizontalStack>
                    }
                    <TextField
                        label=""
                        labelHidden={true}
                        type="text"
                        value={addcolorvalue}
                        autoComplete="off"
                        placeholder="Add color code"
                        suffix={
                            <div style={{ marginRight: "-12px" }}>
                                <Button fullWidth={true} onClick={addColor} primary>Add</Button>
                            </div>
                        }
                        onChange={value => { setAddColorValue(value); setAddColorError(''); }}
                        error={addColorError}
                    />
                    {(colorCodeError || colorNameError) && <InlineError fieldID="colorCodeError" message={colorCodeError || colorNameError} />}
                    <Scrollable style={{ maxHeight: '120px' }} shadow={true}>
                        <VerticalStack gap="3">
                            {
                                formState?.colorTypes[refKey]?.colors?.map((color, index) => (
                                    editingIndex === index ? <HorizontalGrid key={index} gap="2" columns={['oneThird', 'twoThirds', 'twoThirds', 'oneThird', 'oneThird']} alignItems="center">
                                        <img
                                            src="edit-pen.svg"
                                            width={18}
                                            style={{ cursor: "pointer", marginRight: '6px', filter: "contrast(10)" }}
                                            onClick={handleEditRevert}
                                        />
                                        <TextField
                                            label=""
                                            labelHidden={true}
                                            type="text"
                                            value={colorCodeValue}
                                            onChange={val => handleEditingColorCode(val)}
                                            onBlur={handleUpdateingColorCode}
                                            autoComplete="off"
                                            error={colorCodeError ? true : false}
                                        />
                                        <TextField
                                            label=""
                                            labelHidden={true}
                                            type="text"
                                            value={colorNameValue}
                                            onChange={val => handleEditingColorName(val)}
                                            onBlur={handleUpdateingColorName}
                                            autoComplete="off"
                                            error={colorNameError ? true : false}
                                        />
                                        <div onClick={() => handleDeleteColor(index)} style={{ cursor: "pointer" }}>
                                            <Icon source={DeleteMajor} color="critical" />
                                        </div>
                                        <div style={{
                                            width: '25px',
                                            height: '25px',
                                            backgroundColor: colorCodeValue,
                                            border: 'solid 1px'
                                        }}></div>
                                    </HorizontalGrid> : <HorizontalGrid key={index} gap="2" columns={['oneThird', 'oneThird', 'twoThirds', 'oneThird', 'oneThird']} alignItems="center">
                                        <img
                                            src="edit-pen.svg"
                                            width={18}
                                            style={{ marginRight: '6px', cursor: "pointer" }}
                                            onClick={() => handleEdit(index, color)}
                                        />
                                        <Text as="p">{color?.code}</Text>
                                        <Text as="p" alignment="end">{color?.name}</Text>
                                        <RadioButton
                                            label=""
                                            labelHidden={true}
                                            name={`colorbox-${refKey}`}
                                            value={index}
                                            onChange={val => handleSelectColor(index)}
                                            checked={color?.selected}
                                        />
                                        <div style={{
                                            width: '25px',
                                            height: '25px',
                                            backgroundColor: color.code,
                                            border: 'solid 1px'
                                        }}></div>
                                    </HorizontalGrid>
                                ))
                            }
                        </VerticalStack>
                    </Scrollable>
                    <button
                        onClick={() => handleAssignColorType(formState?.colorTypes[refKey])}
                        style={{
                            color: 'white',
                            backgroundColor: formState?.colorTypes[refKey]?.colorCode,
                            padding: 'calc((2.25rem - var(--p-font-line-height-2) - var(--p-space-05))/2) var(--p-space-4)',
                            border: 'none',
                            borderRadius: '0.25rem',
                            minWidth: '2.25rem',
                            minHeight: '2.25rem',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            fontSize: 'var(--p-font-size-100)',
                            fontFamily: 'var(--p-font-family-sans)'
                        }}>Assign</button>
                </VerticalStack>
            </LegacyCard>
        </Grid.Cell>
    )
}