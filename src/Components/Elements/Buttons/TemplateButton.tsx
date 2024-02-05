import React from 'react'
import { Button, ButtonProps } from '@chakra-ui/react'

interface templateButtonType extends ButtonProps {
    text: string
}

const TemplateButton = ({ text, ...props }: templateButtonType) => {
    return (
        <Button colorScheme='black' variant='outline' {...props}>
            {text}
        </Button>
    )
}

export default TemplateButton

