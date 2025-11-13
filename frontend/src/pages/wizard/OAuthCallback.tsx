useEffect(() => {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    fetch('/api/v1/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ code })
    }).then(() => window.close());
  }
}, []);