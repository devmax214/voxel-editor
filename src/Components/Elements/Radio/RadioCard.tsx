import React from "react";
import { Box } from "@chakra-ui/react";
import { useRadio, RadioProps } from "@chakra-ui/radio";

const RadioCard = (props: RadioProps) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor={'pointer'}
        borderWidth={'1px'}
        borderRadius={'md'}
        boxShadow={'md'}
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}        
        _focus={{
          boxShadow: 'outline',
        }}
        px={3}
        py={1.5}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export default RadioCard;