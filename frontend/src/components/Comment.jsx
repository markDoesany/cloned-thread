import { Flex, Text, Avatar, Divider } from "@chakra-ui/react"
// import Actions from "./Actions"
// import { useState } from "react"

function Comment({ reply, lastReply }) {
  return (
    <>
        <Flex gap={4} py={4} my={2} w={'full'}>
          <Avatar src={reply.userProfilePic}/>
          <Flex gap={1} w={'full'} flexDirection={'column'}>
            <Flex w={'full'} justifyContent={'space-between'} alignItems={'center'}>
              <Text fontSize={'sm'} fontWeight={'bold'}>{reply.username}</Text>
              <Flex gap={2} alignItems={'center'}>
                <Text color={'gray.light'} fontSize={'sm'}>{reply.createdAt}</Text>
              </Flex>
            </Flex>
            <Text>{reply.text}</Text>
            {/* <Actions liked={liked} setLiked={setLiked}/>
            <Text fontSize={'sm'} color={'gray.light'}>{likes + (liked? 1 : 0)} likes</Text> */}
          </Flex>
        </Flex>
        {!lastReply ? <Divider/> : null}
    </>
  )
}

export default Comment