import { Button, HorizontalStack, Thumbnail } from "@shopify/polaris";
import { CancelMinor } from '@shopify/polaris-icons';

export function SelectProduct({ formState, setFormState }) {
    const loading = false;
    async function selectProduct() {
        const products = await window.shopify.resourcePicker({
            type: "product",
            action: "select",
        });

        if (products) {
            const { images, id, variants, title, handle } = products[0];
            setFormState({
                ...formState,
                productId: id,
                productHandle: handle,
                productData: {
                    productVariantId: variants[0].id,
                    productTitle: title,
                    productImage: images[0]?.originalSrc,
                },
                image: {},
                colorTypes: [],
                assignColorTypeHover: {},
                submit: true,
                errors: {},
                componentField: 'productload'
            });
        }
    }

    return (
        <HorizontalStack>
            {
                formState?.productData?.productImage &&
                <Thumbnail
                    source={formState?.productData?.productImage}
                    size='extraSmall'
                    alt={formState?.productData?.title}
                />
            }
            <Button disclosure onClick={selectProduct} id="select-product" loading={loading}>
                {formState?.productId ? formState?.productData?.productTitle : 'Select product'}
            </Button>
            {
                formState?.productId && <Button icon={CancelMinor} onClick={() => setFormState({
                    enable: false,
                    submit: false,
                    productId: null,
                    productHandle: null,
                    productData: {},
                    image: {},
                    colorTypes: [],
                    assignColorTypeHover: {},
                    errors: {},
                    componentField: ''
                })} />
            }
        </HorizontalStack>
    )
}