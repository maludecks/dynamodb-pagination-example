const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.APP_ACCESS_KEY,
  secretAccessKey: process.env.APP_SECRET_ACCESS_KEY,
  region: process.env.DB_REGION
});

const docClient = new AWS.DynamoDB.DocumentClient();

export default async function handler(req, res) {
  const response = {
    offset: null,
    list: []
  };

  const { offset, genre } = req.query;

  const query = {
    TableName: process.env.TABLE_NAME,
    IndexName: process.env.INDEX_NAME,
    ScanIndexForward: true,
    KeyConditionExpression: '#genre = :genre',
    ExpressionAttributeNames: {
      '#genre': 'Genre'
    },
    ExpressionAttributeValues: {
      ':genre': genre
    },
    Limit: process.env.PAGE_LIMIT
  };

  if (offset) {
    const [ISBN, name] = offset.split(',');
    query.ExclusiveStartKey = {
      ISBN,
      Name: name,
      Genre: genre
    };
  }

  const batch = await docClient.query(query).promise();

  if (!batch.Items) {
    return response;
  }

  for (const book of batch.Items) {
    response.list.push({
      ISBN: book.ISBN,
      name: book.Name,
      author: book.Author,
      genre: book.Genre
    });
  }

  if (batch.LastEvaluatedKey) {
    response.offset = `${batch.LastEvaluatedKey.ISBN},${batch.LastEvaluatedKey.Name}`;
  }

  return res.json(response);
}