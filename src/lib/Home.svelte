<div class="home-container">
  <h1>Welcome</h1>
  <nav>
    <a href="/timeline" on:click|preventDefault={() => window.navigate('/timeline')}>Timeline</a>
  </nav>
</div>

<style>
  .home-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #fdfdf8;
    font-family: 'Caveat', cursive;
  }

  h1 {
    font-size: 64px;
    margin-bottom: 30px;
    color: #333;
  }

  nav a {
    font-size: 32px;
    color: #4169E1;
    text-decoration: none;
    padding: 15px 30px;
    border: 3px solid #4169E1;
    border-radius: 8px;
    transition: all 0.3s;
  }

  nav a:hover {
    background: #4169E1;
    color: white;
  }
</style>
