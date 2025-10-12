    import express from 'express';

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json()); // For parsing JSON request bodies

    app.get('/', (req, res) => {
      res.send('Hello from TypeScript Express!');
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });