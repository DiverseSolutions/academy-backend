module.exports = {
	id: 'popup',
	handler: (router, { database }) => {

        router.get('/', async (req, res) => {
            try {
              const query = `SELECT * FROM popup`;
              const results = await database.raw(query);
      
              res.json(results[0]);
            } catch (error) {
              res.status(500).json({ error: 'Internal Server Error' });
            }
        });
	}
  };


//   SELECT c.id, c.thumbnail, c.background, COUNT(p.id), SUM(p.view_count) FROM categories c INNER JOIN posts p on c.id = p.category GROUP BY c.id