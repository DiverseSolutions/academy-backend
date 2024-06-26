module.exports = {
	id: 'posts',
	handler: (router, { database }) => {
	  router.get('/search', async (req, res, next) => {
		try {
		  const searchParam = req.query.searchParam;

		  if(searchParam === '' || searchParam == undefined) {
			const response = {
			  posts: [],
			  categories: [],
			};
			res.status(200).json(response);
			return;
		  }
  
		  const postsQuery = `SELECT id, title FROM posts WHERE status = 'published' AND title LIKE ? OR tags LIKE ? LIMIT 10`;
		  const categoriesQuery = `SELECT c.id, c.title FROM posts p RIGHT JOIN categories c ON p.category = c.id WHERE p.status = 'published' AND p.title LIKE ? OR tags LIKE ? OR c.title LIKE ? GROUP BY c.title, c.id LIMIT 10`;
  
		  const [postsResults, categoriesResults] = await Promise.all([
			database.raw(postsQuery, [`%${searchParam}%`, `%${searchParam}%`]),
			database.raw(categoriesQuery, [`%${searchParam}%`, `%${searchParam}%`, `%${searchParam}%`]),
		  ]);
  
		  const response = {
			posts: postsResults[0],
			categories: categoriesResults[0],
		  };
  
		  res.status(200).json(response);
		} catch (error) {
		  next(error);
		}
	  });
  
	  router.get('/', async (req, res) => {
		const { page, size } = req.query;

		if(req.query.featured == 'true') {
			try {
				if(page == undefined || size == undefined) {
					res.status(400).json({ error: 'page and size required' });
					return;
				} else if(size == 0) {
					res.status(400).json({ error: 'size must not be 0' });
					return;
				}

				const query = "SELECT COUNT(comments.id) as totalComments, posts.id, posts.link, title, mini_desc, posts.date_created, thumbnail, type, date FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE status = 'published' AND is_featured = true GROUP BY posts.id ORDER BY posts.date_created DESC LIMIT ? OFFSET ?";
				const countQuery = "SELECT COUNT(*) as totalPages FROM posts WHERE status = 'published' AND is_featured = true";

				const [queryResult, countQueryResult] = await Promise.all([
					database.raw(query, [parseInt(req.query.size), parseInt(req.query.page) * parseInt(req.query.size)]),
					database.raw(countQuery),
				]);

				const totalPages = Math.ceil(parseFloat(countQueryResult[0][0].totalPages != 0 ? countQueryResult[0][0].totalPages / size : countQueryResult[0][0].totalPages));

				const response = {
					contents: queryResult[0],
					totalElements: countQueryResult[0][0].totalPages,
					totalPages: totalPages == 0 ? 1 : totalPages,
				};
				res.status(200).json(response);
			} catch (error) {
				console.log(error);
				res.status(500).json({ error: 'Internal Server Error' });
			};
		} else if(req.query.trending == 'true') {
			database.raw(`SELECT COUNT(comments.id) as totalComments, posts.id, posts.link, title, mini_desc, posts.date_created, view_count, thumbnail, type FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE status = 'published' GROUP BY posts.id, view_count ORDER BY view_count DESC LIMIT 4`)
			.then((results) => {
				res.json(results[0]);
			})
			.catch((error) => {
				res.status(500).json({ error: 'Internal Server Error' });
			});
		} else {
			if(req.query.type) {
				try {
					if(page == undefined || size == undefined) {
						res.status(400).json({ error: 'page and size required' });
						return;
					} else if(size == 0) {
						res.status(400).json({ error: 'size must not be 0' });
						return;
					}

					const query = "SELECT COUNT(comments.id) as totalComments, posts.id, posts.link, title, mini_desc, posts.date_created, view_count, thumbnail, type FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE status = 'published' AND type = ? GROUP BY posts.id, view_count ORDER BY posts.date_created DESC LIMIT ? OFFSET ?";
					const countQuery = "SELECT COUNT(*) as totalPages FROM posts WHERE status = 'published' AND type = ?";

					const [queryResult, countQueryResult] = await Promise.all([
						database.raw(query, [req.query.type, parseInt(req.query.size), parseInt(req.query.page) * parseInt(req.query.size)]),
						database.raw(countQuery, [req.query.type]),
					]);

					const totalPages = Math.ceil(parseFloat(countQueryResult[0][0].totalPages != 0 ? countQueryResult[0][0].totalPages / size : countQueryResult[0][0].totalPages));

					const response = {
						contents: queryResult[0],
						totalElements: countQueryResult[0][0].totalPages,
						totalPages: totalPages == 0 ? 1 : totalPages,
					};
					res.status(200).json(response);
				} catch (error) {
					console.log(error);
					res.status(500).json({ error: 'Internal Server Error' });
				};
			} else {
				try{
					if(page == undefined || size == undefined)  {
						res.status(400).json({ error: 'page and size required' });
						return;
					} else if(size == 0) {
						res.status(400).json({ error: 'size must not be 0' });
						return;
					}

					const query = "SELECT COUNT(comments.id) as totalComments, posts.id, posts.link, title, mini_desc, posts.date_created, view_count, thumbnail, type FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE status = 'published' GROUP BY posts.id, view_count ORDER BY posts.date_created DESC LIMIT ? OFFSET ?";
					const countQuery = "SELECT COUNT(*) as totalPages FROM posts WHERE status = 'published'";

					const [queryResult, countQueryResult] = await Promise.all([
						database.raw(query, [parseInt(req.query.size), parseInt(req.query.page) * parseInt(req.query.size)]),
						database.raw(countQuery),
					]);

					const totalPages = Math.ceil(parseFloat(countQueryResult[0][0].totalPages != 0 ? countQueryResult[0][0].totalPages / size : countQueryResult[0][0].totalPages));

					const response = {
						contents: queryResult[0],
						totalElements: countQueryResult[0][0].totalPages,
						totalPages: totalPages == 0 ? 1 : totalPages,
					};
					res.status(200).json(response);
				} catch (error) {
					console.log(error);
					res.status(500).json({ error: 'Internal Server Error' });
				};
			}
		}
	  });
  
	  router.get('/:id', (req, res) => {
		const postId = req.params.id;
		const query = `SELECT * FROM posts WHERE id = ? AND status = 'published'`;
		
		database.raw(query, [postId])
		.then((results) => {
		  if (results[0].length === 0) {
			res.status(404).json({ error: 'Post not found' });
		  } else {
			const updateViewCountQuery = `UPDATE posts SET view_count = view_count + 1 WHERE id = ?`;
			database.raw(updateViewCountQuery, [postId])
			  .then(() => {
				const getUpdatedPostQuery = `SELECT * FROM posts WHERE id = ?`;
				return database.raw(getUpdatedPostQuery, [postId]);
			  })
			  .then((updatedResults) => {
				var likeQueries = [];
				var tags = JSON.parse(updatedResults[0][0]?.tags);

				if (tags && tags.length > 0)
					for (var i = 0; i < tags.length; i++) 
						likeQueries.push(`tags LIKE ?`);

				var category = updatedResults[0][0]?.category;
				var relatedQuery = `SELECT COUNT(comments.id) as totalComments, posts.tags, posts.category, posts.id, posts.link, title, mini_desc, posts.date_created, thumbnail, type, date FROM posts LEFT JOIN comments ON posts.id = comments.postId WHERE status = 'published' AND (${likeQueries.join(' OR ') != '' ? `(${likeQueries.join(' OR ')}) OR ` : ''} category = ? AND posts.id != ${postId}) GROUP BY posts.id LIMIT 4`;
				var queryParams = tags ? tags.map(tag => `%${tag}%`) : [];

				queryParams.push(category);

				database.raw(relatedQuery, queryParams)
				.then((result) => {
					const response = {
						post: updatedResults[0][0],
						relatedPost: result[0]
					};
					res.status(200).json(response);
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json({ error: 'Internal Server Error' });
				});
			  })
			  .catch((updateError) => {
				console.log(updateError);
				res.status(500).json({ error: 'Internal Server Error' });
			  });
		  }
		})
		.catch((error) => {
		  res.status(500).json({ error: 'Internal Server Error' });
		});
	  });

	  router.get('/:id/comments', async (req, res) => {
		try {
				
			const postId = req.params.id;
			const { page, size } = req.query;

			if(page == undefined || size == undefined) {
				res.status(400).json({ error: 'page and size required' });
				return;
			} else if(size == 0) {
				res.status(400).json({ error: 'size must not be 0' });
				return;
			}
			
			const query = "SELECT * FROM comments WHERE postId = ? ORDER BY date_created DESC LIMIT ? OFFSET ?";
			const countQuery = "SELECT COUNT(*) as totalPages FROM comments WHERE postId = ?";

			const [queryResult, countQueryResult] = await Promise.all([
				database.raw(query, [postId, parseInt(req.query.size), parseInt(req.query.page) * parseInt(req.query.size)]),
				database.raw(countQuery, [postId]),
			]);

			const totalPages = Math.ceil(parseFloat(countQueryResult[0][0].totalPages != 0 ? countQueryResult[0][0].totalPages / size : countQueryResult[0][0].totalPages));

			const response = {
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

	  router.post('/:id/comments', (req, res) => {
		const postId = req.params.id;
		const { name, content } = req.body;
	  
		if (!name) {
		  res.status(400).json({ error: 'name is required' });
		  return; 
		}
	  
		if (!content) {
		  res.status(400).json({ error: 'content is required' });
		  return; 
		}
		const checkPostQuery = `SELECT * FROM posts WHERE id = ? AND status = 'published'`;
	  
		database.raw(checkPostQuery, [postId])
		  .then((postResults) => {
			if (postResults[0].length === 0) {
			  res.status(404).json({ error: 'Post not found' });
			} else {
			  const insertCommentQuery = `INSERT INTO comments (postId, name, content, date_created) VALUES (?, ?, ?, NOW())`;
			  
			  database.raw(insertCommentQuery, [postId, name, content])
				.then(() => {
				  res.status(201).json({ message: 'Comment added successfully' });
				})
				.catch((insertError) => {
					console.log(insertError);
				  res.status(500).json({ error: 'Internal Server Error' });
				});
			}
		  })
		  .catch((error) => {
			console.log(error)
			res.status(500).json({ error: 'Internal Server Error' });
		  });
	  });
	},
};