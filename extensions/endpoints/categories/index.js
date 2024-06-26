module.exports = {
	id: 'categories',
	handler: (router, { database }) => {

	  router.get('/:id/posts', async (req, res) => {
		const categoryId = req.params.id;
		const { page, size } = req.query;
		try {
			if(page == undefined || size == undefined) {
				res.status(400).json({ error: 'page and size required' });
				return;
			} else if(size == 0) {
				res.status(400).json({ error: 'size must not be 0' });
				return;
			}

			const query = "SELECT COUNT(comments.id) as totalComments, posts.id, posts.link, title, date, mini_desc, posts.date_created, thumbnail, type FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE category = ? AND status = 'published' GROUP BY posts.id ORDER BY posts.date_created DESC LIMIT ? OFFSET ?";
			const categoriesQuery = `SELECT * FROM categories WHERE id = ?`;
			const countQuery = "SELECT COUNT(*) as totalPages FROM posts WHERE category = ? AND status = 'published'";

			const [queryResult, categoryResult, countQueryResult] = await Promise.all([
				database.raw(query, [categoryId, parseInt(req.query.size), parseInt(req.query.page) * parseInt(req.query.size)]),
				database.raw(categoriesQuery, [categoryId]),
				database.raw(countQuery, [categoryId]),
			]);

			const totalPages = Math.ceil(parseFloat(countQueryResult[0][0].totalPages != 0 ? countQueryResult[0][0].totalPages / size : countQueryResult[0][0].totalPages));

			const response = {
				category: categoryResult[0].length == 0 ? {} : categoryResult[0][0],
				contents: queryResult[0],
				totalElements: countQueryResult[0][0].totalPages,
				totalPages: totalPages == 0 ? 1 : totalPages,
			};
			res.status(200).json(response);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: 'Internal Server Error' });
		};
	  });
  
	  router.get('/', async (req, res) => {
		try {
		  const query = `SELECT COUNT(posts.id) as totalPosts, categories.* FROM categories LEFT JOIN posts ON categories.id = posts.category AND posts.status = 'published' GROUP BY categories.id`;
		  const results = await database.raw(query);
  
		  res.json(results[0]);
		} catch (error) {
		  res.status(500).json({ error: 'Internal Server Error' });
		}
	  });


	  router.get('/top', async (req, res) => {
		try {
		  const query = `SELECT c.id, c.title, c.thumbnail, COUNT(p.id) AS total_posts, SUM(p.view_count) AS view_count  FROM categories c INNER JOIN posts p on c.id = p.category GROUP BY c.id`;
		  const results = await database.raw(query);
  
		  res.json(results[0]);
		} catch (error) {
		  res.status(500).json({ error: 'Internal Server Error' });
		}
	  });
	}
  };


//   SELECT c.id, c.thumbnail, c.background, COUNT(p.id), SUM(p.view_count) FROM categories c INNER JOIN posts p on c.id = p.category GROUP BY c.id