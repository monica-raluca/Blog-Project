import { useState } from "react";

export function BlogApp() {
    const [articles, setArticles] = useState([]);
    const [articlesTitle, setarticlesTitle] = useState([]);
    const [articleId, setArticleId] = useState('');
    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState([]);

    const fetchAllArticles = async () => {
        const response = await fetch("/api/articles");
        const articles = await response.json();

        setArticles(articles);
    };

    const fetchArticleById = async () => {
        console.log(articleId)
        const response = await fetch("/api/articles/" + articleId);
        const article = await response.json()

        setArticle(article);
    };

    const fetchArticlesByTitle = async () => {
        console.log(articleId)
        const response = await fetch(`/api/articles?title=${title}`);
        const articlesTitle = await response.json()

        setarticlesTitle(articlesTitle);
    };

    const fetchUsers = async () => {
        const response = await fetch(`/api/users`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
    });
        const users = await response.json();

        setUsers(users);
    };

    const login = async () => {
        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username:username,
                password:password}),
    });
            console.log("ADSADA");

        const data = await response.json();

        setToken(data.token);
    }

    return (
        <>
            <button onClick = {fetchAllArticles}> This is a shiny button!</button>
            <ul>
                {articles.map((article, index) => <li key = {index}>{article.title}, {article.content}</li>)}                
            </ul>
            <div>
                <h1>Find Article by ID</h1>

                <input
                    type="text"
                    placeholder="Enter article ID"
                    value={articleId}
                    onChange={(e) => setArticleId(e.target.value)}
                />

                <button onClick={fetchArticleById}>Fetch Article</button>
                <div>id:{articleId}</div>
                {article && (
                    <div>
                    <h2>{article.title}</h2>
                    <p>{article.content}</p>
                    </div>
                )}
            </div>
            <div>
                <h1>Find Articles by Title</h1>
                <input
                    type="text"
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <button onClick={fetchArticlesByTitle}>Fetch Article</button>
                <ul>
                    {articles.map((article, index) => <li key = {index}>{article.title}, {article.content}</li>)}                
                </ul>    
            </div>

            <div>
                <h1>Get Users</h1>
                <button onClick={fetchUsers}>Fetch Users</button>
                {users.map((user, index) => <li key = {index}>{user.username}</li>)}
            </div>

            <div>
                <h1>Login</h1>
                <input
                    type="text"
                    placeholder="Enter username here"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Enter password here"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={login}>Login</button>
                <div>token: {token}</div>

            </div>
        </>
        

        );
}