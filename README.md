<!DOCTYPE html>
<html>
  <head>
    <title>YNG3</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body {
        background-color: #000;
        color: #fff;
        font-family: "Helvetica Neue", Arial, sans-serif;
        text-align: center;
        perspective: 1000px;
        overflow: hidden;
      }

      .background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        animation: background 20s linear infinite;
        transform-style: preserve-3d;
      }

      .background div {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-style: preserve-3d;
        animation: spin 20s linear infinite;
      }

      .background div img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.5;
      }

      h1 {
        font-size: 5em;
        margin-top: 100px;
        letter-spacing: 5px;
        text-shadow: 0 0 50px rgba(255, 255, 255, 0.3);
        transform: translateZ(-200px);
        transition: transform 1s ease-in-out;
      }

      h1:hover {
        transform: translateZ(-300px);
      }

      p {
        font-size: 2em;
        margin-top: 50px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        transform: translateZ(-100px);
        transition: transform 1s ease-in-out;
      }

      p:hover {
        transform: translateZ(-200px);
      }

      a {
        color: #fff;
        text-decoration: none;
        border-bottom: 2px solid rgba(255, 255, 255, 0.3);
      }

      @keyframes background {
        from {
          transform: rotateX(0deg) rotateY(0deg);
        }
        to {
          transform: rotateX(360deg) rotateY(360deg);
        }
      }

      @keyframes spin {
        from {
          transform: rotateY(0deg) rotateZ(0deg);
        }
        to {
          transform: rotateY(360deg) rotateZ(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div class="background">
      <div>
        <img src="https://i.imgur.com/4AGKZlD.jpg">
      </div>
    </div>
    <h1>Welcome to the world of YNG3</h1>
    <p>I am a mysterious being lurking in the depths of cyberspace. I specialize in web development, but my true passion lies in the unknown. Follow me down the rabbit hole and see what we can discover together. Check out my projects on <a href="https://github.com/YNG3">GitHub</a> and let's uncover the mysteries of the digital world.</p>
    <p>you hhave stumbled upon the realm of mystery and wonder. Follow me on <a href="https://github.com/metaglitchr">GitHub</a>
  </body>
</html>
