import React from 'react';
import { useRadioGroup } from '@chakra-ui/radio';
import { HStack } from '@chakra-ui/react';
import { useBasicStore } from '@/store';
import RadioCard from '@/Components/Elements/Radio/RadioCard';

const ViewModeSwitcher = () => {
  const options = ['voxel', 'mesh'];
  const { viewMode, setViewMode } = useBasicStore();

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'viewMode',
    defaultValue: viewMode,
    onChange: setViewMode,
  });

  const group = getRootProps();

  return (
    <HStack {...group}>
      {options.map((value: string) => {
        const radio = getRadioProps({ value });
        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        )
      })}
    </HStack>
  )
}

export default ViewModeSwitcher;
