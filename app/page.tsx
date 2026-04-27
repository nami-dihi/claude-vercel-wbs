import { Box, Heading, Text } from '@chakra-ui/react'

export default function Home() {
  return (
    <Box p={8}>
      <Heading mb={2}>WBS Manager</Heading>
      <Text color="gray.500">Task 목록이 여기에 표시됩니다.</Text>
    </Box>
  )
}
