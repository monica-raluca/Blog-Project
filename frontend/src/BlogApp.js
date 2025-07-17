import React, { useState, useEffect } from 'react'
 
export function BlogApp() {
  const [articles, setArticles] = useState([]);
 
  useEffect(() => {
    fetch("/api/articles")
      .then(response => response.json())
      .then((data) => {
        setArticles(data);
      });
  }, []);
 
  return (
    <div className='articles'>
      {articles.map((article) => (
        <div className='article' key={article.id}>
          <div className='title'>{article.title}</div>
          <ArticleChanges article={article}></ArticleChanges>
          <div className='content'>{article.content}</div>
          <pre>
            {JSON.stringify(article, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
 
export function ArticleChanges(props) {
  return (
    <div className='article-changes'>
      Created on {props.article.createdDate} by <a href="">{props.article.author.username}</a>.
      {
        props.article.author.username ? (
          <>Updated on {props.article.updatedDate} by <a href="">{props.article.author.username}</a>.</>
        ) : <></>
      }
    </div>
  );
}