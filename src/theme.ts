import { extendTheme, defineStyleConfig } from '@chakra-ui/react'

const Button = defineStyleConfig({
    baseStyle: {
        borderRadius: '8px',
    },
    sizes: {
        xs: {
            fontSize: '24px',
        },
        sm: {},
        md: {
            fontSize: 'md',
        },
    },
})

const Text = defineStyleConfig({
    baseStyle: {
        color: '#575757',
    },
})


const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

const theme = {
    config,
    components: {
        Text,
        Button,
        Checkbox: {
            baseStyle: {
                label: {
                    width: '100%',
                },
            },
        },
    },
    fontSizes: {
        xs: '8px',
        sm: '11px',
        md: '14px',
    },
    colors: {
        primary: '#00000',
        purple: '#907CFF',
        dark: '#575757',
    },
}

export const formikFieldProps = {
    borderRadius: ['2px', '4px', '4px', '6px'],
    height: ['30px', '36px', '36px', '44px'],
    color: '#ffffff',
    fontFamily: 'Noto Sans',
    bg: '#ebebeb',
    border: 'solid 1px',
    borderColor: 'gray.200',
}

export default extendTheme(theme)
