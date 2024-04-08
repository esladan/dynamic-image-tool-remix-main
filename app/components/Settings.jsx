import {
  LegacyCard,
  LegacyStack,
  Button,
  Collapsible,
  VerticalStack,
  TextField,
  Grid,
} from '@shopify/polaris';
import {useState, useCallback} from 'react';

export function Settings() {
  const [open, setOpen] = useState(false);
  const [keyValue, setKeyValue] = useState('');
  const [endpointValue, setEndpointValue] = useState('');

  const handleToggle = useCallback(() => setOpen((open) => !open), []);
  const handleKeyFieldChange = useCallback(
    (value) => setKeyValue(value),
    [],
  );
  const handleEndpointFieldChange = useCallback(
    (value) => setEndpointValue(value),
    [],
  );
  return (
      <LegacyCard sectioned>
        <LegacyStack vertical>
          <Button
            onClick={handleToggle}
            ariaExpanded={open}
            ariaControls="basic-collapsible"
            fullWidth={true}
            disclosure={open ? 'up':'down'}
            textAlign='left'
          >
            Settings
          </Button>
          <Collapsible
            open={open}
            id="basic-collapsible"
            transition={{duration: '500ms', timingFunction: 'ease-in-out'}}
            expandOnPrint
          >
            <VerticalStack>
              <Grid>
                <Grid.Cell columnSpan={{xs: 6, sm: 1, md: 3, lg: 3, xl: 3}}>
                  API KEY
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 5, md: 9, lg: 9, xl: 9}}>
                  <TextField
                    label='API KEY'
                    placeholder='API KEY'
                    labelHidden
                    value={keyValue}
                    onChange={handleKeyFieldChange}
                    autoComplete='off'
                  />
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 1, md: 3, lg: 3, xl: 3}}>
                  ENDPOINT
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 6, sm: 5, md: 9, lg: 9, xl: 9}}>
                  <TextField
                    label="ENDPOINT"
                    placeholder='ENDPOINT'
                    labelHidden
                    value={endpointValue}
                    onChange={handleEndpointFieldChange}
                    autoComplete="off"
                  />
                </Grid.Cell>
              </Grid>
            </VerticalStack>
          </Collapsible>
        </LegacyStack>
      </LegacyCard>
  );
}