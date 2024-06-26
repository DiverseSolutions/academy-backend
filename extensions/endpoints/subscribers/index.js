const nodemailer = require("nodemailer");

const email = process.env.EMAIL;
const password = process.env.EMAIL_PASSWORD;

module.exports = {
  id: "subscribers",
  handler: (router, { database }) => {
    router.get("/emails", async (req, res) => {
      try {
        const subscribersQuery = "SELECT email FROM subscribers";
        const results = await database.raw(subscribersQuery);
        const subscribers = results[0].map((item) => item.email);

        res.status(200).json({ subscribers });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    router.post("/notify", async (req, res) => {
      try {
        const { payload } = req.body;

		if(!payload?.notify) 
			return res.status(200);

        const subscribersQuery = "SELECT email FROM subscribers";
        const results = await database.raw(subscribersQuery);
        const subscribers = results[0].map((item) => item.email);

        if (subscribers.length === 0)
          return res.status(200).json({ message: "No subscribers to notify." });

        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: email,
            pass: password,
          },
        });

        const mailOptions = {
          from: "academytester91@gmail.com",
          to: subscribers.join(", "),
          subject: "Ард Академи",
          text: `"${payload.title}" нэмэгдлээ.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Emails sent to subscribers." });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    router.post("/", async (req, res) => {
      try {
        const { email } = req.body;

        const checkQuery = "SELECT COUNT(*) as count FROM subscribers WHERE email = ?";
        const [result] = await database.raw(checkQuery, [email]);

        if (result[0].count > 0) {
          return res.status(400).json({ error: "Subscriber already exists." });
        }

        await database.raw("INSERT INTO subscribers(email) VALUES (?)", [email]);
        res.status(201).json({ message: "Subscriber added successfully." });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
};
