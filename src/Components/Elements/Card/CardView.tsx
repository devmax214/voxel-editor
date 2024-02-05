import { Box, Flex, Progress, Text, Image } from '@chakra-ui/react'
import React from 'react'

const CardView = ({ progress, imageLink }: { progress?: number, imageLink?: string }) => {
  return (
    <Flex w={progress ? 200 : 'fit-content'} position={'relative'} m={2}>
      <Box w={70} h={70} bg={'gray.300'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        {/* <Text fontSize='sm'>Image</Text> */}
        <Image src={(imageLink != "" && imageLink) ? imageLink: "default_image.jpg"} alt='Image' />
      </Box>
      {(progress || progress == 0) && 
        <Progress colorScheme='blue' w={'110px'} bg={'gray.300'} height='20px' mt={6} value={progress} hasStripe mx={2}>
          {progress}
        </Progress>
      }
    </Flex>
  )
}

export default CardView