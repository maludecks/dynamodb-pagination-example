import Head from "next/head";
import { useState } from "react";
import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";

export default function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [pageHistory, setPageHistory] = useState([]);
  const [paginationOffset, setPaginationOffset] = useState(0);
  const [genre, setGenre] = useState('');

  const fetchBooks = (genre, offset) => {
    setGenre(genre);
    let endpoint = `api/books?genre=${genre}`;

    if (offset) {
      endpoint += `&offset=${offset}`;
    }

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.list);
        setPaginationOffset(data.offset);
      });
  }

  const getNextPage = () => {
    setPageHistory([...pageHistory, paginationOffset]);
    fetchBooks(genre, paginationOffset);
  };

  const getPreviousPage = () => {
    const previousPage = pageHistory[pageHistory.length - 2];
    setPageHistory(pageHistory.slice(0, pageHistory.length - 1));
    fetchBooks(genre, previousPage);
  };

  const selectGenre = (genre) => {
    setPageHistory([]);
    fetchBooks(genre);
  };

  return (
    <Flex width="100vw" height="100vh" direction="column" align="center" justify="center">
      <Head>
          <title>Bookshelf</title>
          <meta name="description" content="Bookshelf - a list of books in DynamoDB with pagination" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Text fontSize="4em">Bookshelf</Text>
        <Text>Choose a genre to start</Text>
        
        <Stack direction="row" spacing={4} align="center" m={4}>
          <Button colorScheme="teal" variant="outline" onClick={() => selectGenre('fiction')}>
            Fiction
          </Button>
          <Button colorScheme="teal" variant="outline" onClick={() => selectGenre('novel')}>
            Novel
          </Button>
        </Stack>

        <Grid gap={2} autoFlow="row dense">
          { books.map(book => (
            <Box key={book.ISBN} m={2}>{book.name}, {book.author}</Box>
          ))}
        </Grid>

        <Stack direction="row" spacing={4} align="center" m={4}>
          <Button colorScheme="teal" variant="outline" onClick={getPreviousPage} isDisabled={pageHistory.length < 1}>
            <ArrowLeftIcon w={3} h={3} />
          </Button>
          <Button colorScheme="teal" variant="outline" onClick={getNextPage} isDisabled={!paginationOffset}>
            <ArrowRightIcon w={3} h={3} />
          </Button>
        </Stack>
    </Flex>
  )
}
