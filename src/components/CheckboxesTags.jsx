import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Assuming CheckboxesTags accepts props for state management
export default function CheckboxesTags({ selectedConnectors, setSelectedConnectors }) {
    const connectorTypes = [
      { title: 'CHAdeMO' },
      { title: 'CCS (Type 2)' },
      { title: 'Shuko' },
      { title: 'Three Phase' },
      { title: 'Type 2' },
      { title: 'J-1772' },
      { title: 'Tesla' }
    ];
  
    return (
      <Autocomplete
        multiple
        id="checkboxes-tags"
        options={connectorTypes}
        getOptionLabel={(option) => option.title}
        value={selectedConnectors}
        onChange={(event, newValue) => {
          setSelectedConnectors(newValue);
        }}
        style={{ width: 280 }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Connector Types" placeholder="Select connectors" />
        )}
      />
    );
  }
  